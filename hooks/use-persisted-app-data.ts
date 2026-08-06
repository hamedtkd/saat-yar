"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { initialData } from "@/lib/constants";
import { AppDataStorageAdapter } from "@/lib/storage";
import type { RecoverySnapshot } from "@/lib/recovery";
import type { AppData, StorageInfo } from "@/lib/types";
import { localDateKey } from "@/lib/format";
import {
  applyPendingClose, applyStaleHeartbeat, createPendingClose, createSessionHeartbeat,
  parsePendingClose, parseSessionHeartbeat, SESSION_CLOSE_KEY, SESSION_HEARTBEAT_INTERVAL_MS,
  SESSION_HEARTBEAT_KEY,
} from "@/lib/session-close";
import { useMultiTabDataSync } from "./use-multi-tab-data-sync";

export type SaveState = "idle" | "saving" | "saved" | "error";

export function usePersistedAppData() {
  const storage = useMemo(() => new AppDataStorageAdapter(), []);
  const [data, setData] = useState<AppData>(initialData);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState("");
  const [online, setOnline] = useState(true);
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({ usage: 0, quota: 0, persisted: false });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");
  const [recoverySnapshot, setRecoverySnapshot] = useState<RecoverySnapshot | null>(null);
  const latestDataRef = useRef(data);
  useEffect(() => {
    latestDataRef.current = data;
  }, [data]);
  const {
    externalSyncPending, multiTabSyncStatus, publishSaved, consumeSkipNextPersist,
    reloadExternalData, dismissExternalSync, clearMultiTabSyncHistory,
  } = useMultiTabDataSync({ ready, saveState, storage, setData, setToast });
  useEffect(() => {
    void (async () => {
      try {
        const { value, migrated, migratedFrom } = await storage.load();
        if (value) {
          const pending = parsePendingClose(window.localStorage.getItem(SESSION_CLOSE_KEY));
          const heartbeat = parseSessionHeartbeat(window.localStorage.getItem(SESSION_HEARTBEAT_KEY));
          const restoredFromClose = pending ? applyPendingClose(value, pending) : value;
          const restored = pending || !heartbeat ? restoredFromClose : applyStaleHeartbeat(restoredFromClose, heartbeat);
          setData(restored);
          if (restored !== value) {
            setToast(pending
              ? "خروج آخر هنگام بستن صفحه ثبت شد؛ لطفاً زمان را بررسی کنید"
              : "نشست باز پس از قطع ناگهانی تا آخرین زمان فعال ثبت شد؛ لطفاً آن را بررسی کنید");
          }
          window.localStorage.removeItem(SESSION_CLOSE_KEY);
          if (restored !== value || !heartbeat) window.localStorage.removeItem(SESSION_HEARTBEAT_KEY);
        }
        setRecoverySnapshot(storage.loadRecovery());
        if (migrated) {
          setToast(
            migratedFrom
              ? `اطلاعات نسخه ${migratedFrom.toLocaleString("fa-IR")} با موفقیت منتقل شد`
              : "اطلاعات نسخه قبلی با موفقیت منتقل شد",
          );
        }
        setStorageInfo(await storage.estimate());
      } catch {
        setToast("خواندن اطلاعات قبلی ممکن نشد؛ از نسخه بازیابی یا فایل پشتیبان استفاده کنید");
      } finally {
        setReady(true);
      }
    })();
  }, [storage]);

  const persistData = useCallback(async (value: AppData) => {
    setSaveState("saving");
    setSaveError("");
    const recovery = storage.saveRecovery(value, "autosave");
    if (recovery) setRecoverySnapshot(recovery);
    try {
      await storage.save(value);
      const savedAt = new Date();
      setLastSavedAt(savedAt.toISOString());
      publishSaved(savedAt);
      setSaveState("saved");
      setStorageInfo(await storage.estimate());
      return true;
    } catch {
      const failedRecovery = storage.saveRecovery(value, "save-failed");
      if (failedRecovery) setRecoverySnapshot(failedRecovery);
      setSaveState("error");
      setSaveError(failedRecovery
        ? "ذخیره اصلی ناموفق بود؛ یک نسخه بازیابی اضطراری در مرورگر نگه داشته شد."
        : "ذخیره اصلی و نسخه بازیابی هر دو ناموفق بودند؛ همین حالا فایل پشتیبان دانلود کنید.");
      return false;
    }
  }, [publishSaved, storage]);
  useEffect(() => {
    if (!ready) return;
    if (consumeSkipNextPersist()) return;
    const id = window.setTimeout(() => {
      void persistData(data);
    }, 220);
    return () => window.clearTimeout(id);
  }, [consumeSkipNextPersist, data, persistData, ready]);


  useEffect(() => {
    if (!ready) return;
    const writeHeartbeat = () => {
      const today = localDateKey();
      const record = latestDataRef.current.records[today];
      const heartbeat = record ? createSessionHeartbeat(today, record) : null;
      if (heartbeat) window.localStorage.setItem(SESSION_HEARTBEAT_KEY, JSON.stringify(heartbeat));
      else window.localStorage.removeItem(SESSION_HEARTBEAT_KEY);
    };
    writeHeartbeat();
    const id = window.setInterval(writeHeartbeat, SESSION_HEARTBEAT_INTERVAL_MS);
    const handleVisibility = () => { if (document.visibilityState === "hidden") writeHeartbeat(); };
    window.addEventListener("pagehide", writeHeartbeat);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("pagehide", writeHeartbeat);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const today = localDateKey();
      const record = latestDataRef.current.records[today];
      const pending = record ? createPendingClose(today, record) : null;
      if (pending) window.localStorage.setItem(SESSION_CLOSE_KEY, JSON.stringify(pending));
      if (saveState === "saving" || pending) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [ready, saveState]);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  const retrySave = useCallback(async () => {
    const saved = await persistData(latestDataRef.current);
    setToast(saved ? "ذخیره دوباره انجام شد" : "ذخیره دوباره ناموفق بود");
  }, [persistData, setToast]);

  const createManualRecovery = useCallback(() => {
    const snapshot = storage.saveRecovery(latestDataRef.current, "manual");
    if (snapshot) {
      setRecoverySnapshot(snapshot);
      setToast("نسخه بازیابی محلی ساخته شد");
    } else {
      setToast("ساخت نسخه بازیابی ممکن نشد؛ فایل پشتیبان دانلود کنید");
    }
    return snapshot;
  }, [setToast, storage]);

  const restoreRecovery = useCallback(() => {
    const recovered = storage.restoreRecovery();
    if (!recovered) {
      setToast("نسخه بازیابی معتبری پیدا نشد");
      return false;
    }
    setData(recovered);
    setToast("نسخه بازیابی برگردانده شد");
    return true;
  }, [setToast, storage]);

  const clearRecovery = useCallback(() => {
    storage.clearRecovery();
    setRecoverySnapshot(null);
    setToast("نسخه بازیابی محلی حذف شد");
  }, [setToast, storage]);

  return {
    data, setData, ready, toast, setToast, online,
    storageInfo, setStorageInfo, storage,
    saveState, lastSavedAt, saveError, recoverySnapshot,
    retrySave, createManualRecovery, restoreRecovery, clearRecovery,
    externalSyncPending, multiTabSyncStatus, clearMultiTabSyncHistory,
    reloadExternalData, dismissExternalSync,
  };
}
