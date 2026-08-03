"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { initialData } from "@/lib/constants";
import { AppDataStorageAdapter } from "@/lib/storage";
import type { RecoverySnapshot } from "@/lib/recovery";
import type { AppData, StorageInfo } from "@/lib/types";

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

  useEffect(() => {
    void (async () => {
      try {
        const { value, migrated, migratedFrom } = await storage.load();
        if (value) setData(value);
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
      setLastSavedAt(new Date().toISOString());
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
  }, [storage]);

  useEffect(() => {
    if (!ready) return;
    const id = window.setTimeout(() => {
      void persistData(data);
    }, 220);
    return () => window.clearTimeout(id);
  }, [data, persistData, ready]);

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
    data,
    setData,
    ready,
    toast,
    setToast,
    online,
    storageInfo,
    setStorageInfo,
    storage,
    saveState,
    lastSavedAt,
    saveError,
    recoverySnapshot,
    retrySave,
    createManualRecovery,
    restoreRecovery,
    clearRecovery,
  };
}
