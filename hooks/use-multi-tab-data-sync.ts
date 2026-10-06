"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { APP_SYNC_CHANNEL, createDataSavedMessage, createTabId, isAppSyncMessage } from "@/lib/multi-tab-sync";
import { addSyncEvent, clearSyncHistory, createInitialSyncStatus } from "@/lib/multi-tab-sync-status";
import { hasUnsavedSettingsDrafts } from "@/lib/settings-draft-registry";
import { OneShotPersistenceSkip, type AppDataSyncGuard } from "@/lib/app-data-sync-guard";
import { getBrowserLocale } from "@/lib/i18n";
import { translateSystem } from "@/lib/i18n/system";
import type { AppDataStorageAdapter } from "@/lib/storage";
import type { AppData } from "@/lib/types";
import type { SaveState } from "./use-persisted-app-data";

type Params = {
  ready: boolean;
  saveState: SaveState;
  storage: AppDataStorageAdapter;
  setToast: (message: string) => void;
  syncGuard: AppDataSyncGuard;
  applyExternalData: (value: AppData, revision: string | null) => boolean;
  onExternalConflict: () => void;
};

export function useMultiTabDataSync({ ready, saveState, storage, setToast, syncGuard, applyExternalData, onExternalConflict }: Params) {
  const [externalSyncPending, setExternalSyncPending] = useState(false);
  const [multiTabSyncStatus, setMultiTabSyncStatus] = useState(createInitialSyncStatus);
  const tabIdRef = useRef("");
  const channelRef = useRef<BroadcastChannel | null>(null);
  const [persistenceSkip] = useState(() => new OneShotPersistenceSkip());
  const markExternalConflict = useCallback(() => {
    syncGuard.markConflict();
    setExternalSyncPending(true);
    onExternalConflict();
  }, [onExternalConflict, syncGuard]);

  const consumeSkipNextPersist = useCallback(() => {
    return persistenceSkip.consume();
  }, [persistenceSkip]);

  const publishSaved = useCallback((savedAt: Date) => {
    channelRef.current?.postMessage(createDataSavedMessage(tabIdRef.current, savedAt, window.location.pathname));
  }, []);

  const hasUnresolvedExternalConflict = useCallback(() => syncGuard.hasConflict(), [syncGuard]);
  const resolveExternalConflict = useCallback((skipNextPersist = false) => {
    syncGuard.resolveConflict();
    if (skipNextPersist) persistenceSkip.skipNext();
    setExternalSyncPending(false);
    setMultiTabSyncStatus((current) => ({ ...current, pending: false }));
  }, [persistenceSkip, syncGuard]);

  const loadExternalData = useCallback(async (explicitDiscard = false) => {
    if (hasUnsavedSettingsDrafts()) {
      setToast(translateSystem(getBrowserLocale(), "Save or discard the changes you are editing first."));
      return false;
    }
    const startingGeneration = syncGuard.currentGeneration();
    const { value, revision } = await storage.load();
    if (!value) return false;
    if (hasUnsavedSettingsDrafts()) {
      markExternalConflict();
      return false;
    }
    if (explicitDiscard) {
      if (syncGuard.currentGeneration() !== startingGeneration) {
        markExternalConflict();
        return false;
      }
    } else if (syncGuard.deferRemoteUpdate(saveState === "saving")) {
      markExternalConflict();
      return false;
    }
    if (!applyExternalData(value, revision)) return false;
    persistenceSkip.skipNext();
    setExternalSyncPending(false);
    setMultiTabSyncStatus((current) => ({ ...current, pending: false }));
    setToast(translateSystem(getBrowserLocale(), "Changes from another tab were loaded."));
    return true;
  }, [applyExternalData, markExternalConflict, persistenceSkip, saveState, setToast, storage, syncGuard]);

  useEffect(() => {
    if (!ready || typeof BroadcastChannel === "undefined") return;
    tabIdRef.current = createTabId();
    queueMicrotask(() => setMultiTabSyncStatus((current) => ({
      ...current, supported: true, currentTabId: tabIdRef.current,
    })));
    const channel = new BroadcastChannel(APP_SYNC_CHANNEL);
    channelRef.current = channel;
    const onMessage = (event: MessageEvent) => {
      if (!isAppSyncMessage(event.data) || event.data.tabId === tabIdRef.current) return;
      const receivedAt = new Date().toISOString();
      const hasDraft = hasUnsavedSettingsDrafts();
      const pending = hasDraft || syncGuard.deferRemoteUpdate(saveState === "saving");
      setMultiTabSyncStatus((current) => addSyncEvent(current, {
        kind: pending ? "deferred" : "loaded",
        sourceTabId: event.data.tabId,
        savedAt: event.data.savedAt,
        receivedAt,
        sourcePath: event.data.sourcePath,
        changeKind: event.data.changeKind,
      }));
      if (pending) {
        markExternalConflict();
        return;
      }
      void loadExternalData();
    };
    channel.addEventListener("message", onMessage);
    return () => {
      channel.removeEventListener("message", onMessage);
      channel.close();
      channelRef.current = null;
    };
  }, [loadExternalData, markExternalConflict, ready, saveState, syncGuard]);

  return {
    externalSyncPending,
    multiTabSyncStatus,
    publishSaved,
    consumeSkipNextPersist,
    hasUnresolvedExternalConflict,
    markExternalConflict,
    resolveExternalConflict,
    reloadExternalData: () => loadExternalData(true),
    dismissExternalSync: () => setExternalSyncPending(false),
    clearMultiTabSyncHistory: () => setMultiTabSyncStatus(clearSyncHistory),
  };
}
