"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { initialData } from "@/lib/constants";
import { AsyncTaskQueue } from "@/lib/async-task-queue";
import { AppDataSyncGuard, scheduleGuardedSave } from "@/lib/app-data-sync-guard";
import { AppDataSaveConflictError, AppDataStorageAdapter } from "@/lib/storage";
import type { RecoverySnapshot } from "@/lib/recovery";
import type { AppData, StorageInfo } from "@/lib/types";
import { getBrowserLocale } from "@/lib/i18n";
import { formatLocaleNumber } from "@/lib/i18n/formatters";
import { translateSystem } from "@/lib/i18n/system";
import { hasUnsavedSettingsDrafts } from "@/lib/settings-draft-registry";
import {
  applyPendingClose, applyStaleHeartbeat, parsePendingClose, parseSessionHeartbeat,
  SESSION_CLOSE_KEY, SESSION_HEARTBEAT_KEY,
} from "@/lib/session-close";
import { useMultiTabDataSync } from "./use-multi-tab-data-sync";
import { usePersistedBrowserEffects } from "./use-persisted-browser-effects";

export type SaveState = "idle" | "saving" | "saved" | "error";

export function usePersistedAppData() {
  const storage = useMemo(() => new AppDataStorageAdapter(), []);
  const [data, setDataState] = useState<AppData>(initialData);
  const dataRef = useRef(data);
  const latestDataRef = dataRef;
  const readyRef = useRef(false);
  const [syncGuard] = useState(() => new AppDataSyncGuard());
  const persistenceRevisionRef = useRef<string | null>(null);
  const persistenceQueueRef = useRef(new AsyncTaskQueue());
  const enqueuePersistence = useCallback(<T,>(task: () => Promise<T>) => persistenceQueueRef.current.run(task), []);
  const setData = useCallback((update: AppData | ((current: AppData) => AppData)) => {
    const current = dataRef.current;
    const next = typeof update === "function" ? update(current) : update;
    if (next === current) return;
    dataRef.current = next;
    if (readyRef.current) {
      syncGuard.markLocalChange();
    }
    setDataState(next);
  }, [syncGuard]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState("");
  const [online, setOnline] = useState(true);
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({ usage: 0, quota: 0, persisted: false });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");
  const [recoverySnapshot, setRecoverySnapshot] = useState<RecoverySnapshot | null>(null);
  usePersistedBrowserEffects({ ready, latestDataRef, saveState, toast, setOnline, setToast });
  const saveIndicatorTimerRef = useRef<number | null>(null);
  const applyExternalData = useCallback((value: AppData, revision: string | null) => {
    const currentRevision = persistenceRevisionRef.current;
    if (revision && currentRevision && Date.parse(revision) < Date.parse(currentRevision)) return false;
    dataRef.current = value;
    setDataState(value);
    syncGuard.applyRemoteUpdate();
    persistenceRevisionRef.current = revision;
    return true;
  }, [syncGuard]);
  const preserveLocalConflict = useCallback(() => {
    const recovery = storage.saveRecovery(dataRef.current, "save-failed");
    if (recovery) setRecoverySnapshot(recovery);
  }, [storage]);
  useEffect(() => {
    const timerRef = saveIndicatorTimerRef;
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);
  const {
    externalSyncPending, multiTabSyncStatus, publishSaved, consumeSkipNextPersist,
    reloadExternalData, dismissExternalSync, clearMultiTabSyncHistory,
    hasUnresolvedExternalConflict, markExternalConflict, resolveExternalConflict,
  } = useMultiTabDataSync({
    ready, saveState, storage, setToast, syncGuard,
    applyExternalData, onExternalConflict: preserveLocalConflict,
  });
  useEffect(() => {
    void (async () => {
      try {
        const { value, revision, migrated, migratedFrom } = await storage.load();
        persistenceRevisionRef.current = revision;
        if (value) {
          const pending = parsePendingClose(window.localStorage.getItem(SESSION_CLOSE_KEY));
          const heartbeat = parseSessionHeartbeat(window.localStorage.getItem(SESSION_HEARTBEAT_KEY));
          const restoredFromClose = pending ? applyPendingClose(value, pending) : value;
          const restored = pending || !heartbeat ? restoredFromClose : applyStaleHeartbeat(restoredFromClose, heartbeat);
          dataRef.current = restored;
          setDataState(restored);
          if (restored !== value) {
            syncGuard.markLocalChange();
          }
          if (restored !== value) {
            setToast(pending
              ? translateSystem(getBrowserLocale(), "Last clock-out was recovered from page close; please review the time.")
              : translateSystem(getBrowserLocale(), "An open session was recovered to the last active time after an interruption; please review it."));
          }
          window.localStorage.removeItem(SESSION_CLOSE_KEY);
          if (restored !== value || !heartbeat) window.localStorage.removeItem(SESSION_HEARTBEAT_KEY);
        }
        setRecoverySnapshot(storage.loadRecovery());
        if (migrated) {
          setToast(
            migratedFrom
              ? translateSystem(getBrowserLocale(), "Data from version {version} was migrated successfully.", { version: formatLocaleNumber(getBrowserLocale(), migratedFrom) })
              : translateSystem(getBrowserLocale(), "Data from the previous version was migrated successfully."),
          );
        }
        setStorageInfo(await storage.estimate());
      } catch {
        setToast(translateSystem(getBrowserLocale(), "Previous data could not be read; use local recovery or a backup file."));
      } finally {
        readyRef.current = true;
        setReady(true);
      }
    })();
  }, [storage, syncGuard]);

  const persistData = useCallback((value: AppData) => enqueuePersistence(async () => {
    if (saveIndicatorTimerRef.current !== null) {
      window.clearTimeout(saveIndicatorTimerRef.current);
      saveIndicatorTimerRef.current = null;
    }
    setSaveState("saving");
    setSaveError("");
    const saveGeneration = syncGuard.captureSaveGeneration();
    const recovery = storage.saveRecovery(value, "autosave");
    if (recovery) setRecoverySnapshot(recovery);
    try {
      persistenceRevisionRef.current = await storage.saveIfRevision(value, persistenceRevisionRef.current);
      syncGuard.confirmSave(saveGeneration);
      const savedAt = new Date();
      setLastSavedAt(savedAt.toISOString());
      publishSaved(savedAt);
      setSaveState("saved");
      saveIndicatorTimerRef.current = window.setTimeout(() => {
        setSaveState("idle");
        saveIndicatorTimerRef.current = null;
      }, 2600);
      setStorageInfo(await storage.estimate());
      return true;
    } catch (error) {
      syncGuard.failSave();
      const failedRecovery = storage.saveRecovery(value, "save-failed");
      if (failedRecovery) setRecoverySnapshot(failedRecovery);
      setSaveState("error");
      if (error instanceof AppDataSaveConflictError) {
        markExternalConflict();
        setSaveError(translateSystem(getBrowserLocale(), "Data changed in another tab. Resolve the conflict before saving again."));
        return false;
      }
      setSaveError(failedRecovery
        ? translateSystem(getBrowserLocale(), "Primary save failed; an emergency recovery copy was kept in the browser.")
        : translateSystem(getBrowserLocale(), "Primary save and recovery both failed; download a backup now."));
      return false;
    }
  }), [enqueuePersistence, markExternalConflict, publishSaved, storage, syncGuard]);
  useEffect(() => {
    if (!ready || hasUnresolvedExternalConflict()) return;
    if (consumeSkipNextPersist()) return;
    return scheduleGuardedSave(data, 220, () => !hasUnresolvedExternalConflict(), (value) => { void persistData(value); });
  }, [consumeSkipNextPersist, data, externalSyncPending, hasUnresolvedExternalConflict, persistData, ready]);
  const retrySave = useCallback(async () => {
    const saved = await persistData(latestDataRef.current);
    setToast(saved ? translateSystem(getBrowserLocale(), "Save retry succeeded.") : translateSystem(getBrowserLocale(), "Save retry failed."));
  }, [latestDataRef, persistData, setToast]);

  const recordPersistedRevision = useCallback((revision: string) => {
    persistenceRevisionRef.current = revision;
  }, []);

  const keepLocalChanges = useCallback(async () => {
    if (hasUnsavedSettingsDrafts()) {
      setToast(translateSystem(getBrowserLocale(), "Save or discard the changes you are editing first."));
      return;
    }
    try {
      persistenceRevisionRef.current = (await storage.load()).revision;
      resolveExternalConflict(true);
      const saved = await persistData(latestDataRef.current);
      setToast(translateSystem(getBrowserLocale(), saved ? "Local changes replaced the newer version and were saved." : "Your local changes are still available but could not be saved."));
    } catch {
      setToast(translateSystem(getBrowserLocale(), "Your local changes are still available but could not be saved."));
    }
  }, [latestDataRef, persistData, resolveExternalConflict, setToast, storage]);

  const createManualRecovery = useCallback(() => {
    const snapshot = storage.saveRecovery(latestDataRef.current, "manual");
    if (snapshot) {
      setRecoverySnapshot(snapshot);
      setToast(translateSystem(getBrowserLocale(), "Local recovery snapshot was created."));
    } else {
      setToast(translateSystem(getBrowserLocale(), "Recovery snapshot could not be created; download a backup file."));
    }
    return snapshot;
  }, [latestDataRef, setToast, storage]);

  const restoreRecovery = useCallback(() => {
    const recovered = storage.restoreRecovery();
    if (!recovered) {
      setToast(translateSystem(getBrowserLocale(), "No valid recovery snapshot was found."));
      return false;
    }
    setData(recovered);
    setToast(translateSystem(getBrowserLocale(), "Recovery snapshot was restored."));
    return true;
  }, [setData, setToast, storage]);

  const clearRecovery = useCallback(() => {
    storage.clearRecovery();
    setRecoverySnapshot(null);
    setToast(translateSystem(getBrowserLocale(), "Local recovery snapshot was deleted."));
  }, [setToast, storage]);

  return {
    data, setData, ready, toast, setToast, online,
    storageInfo, setStorageInfo, storage,
    saveState, lastSavedAt, saveError, recoverySnapshot,
    retrySave, createManualRecovery, restoreRecovery, clearRecovery, persistImmediately: persistData,
    enqueuePersistence,
    externalSyncPending, multiTabSyncStatus, clearMultiTabSyncHistory, recordPersistedRevision,
    reloadExternalData, dismissExternalSync,
    keepLocalChanges,
  };
}
