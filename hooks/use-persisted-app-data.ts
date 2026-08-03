"use client";

import { useEffect, useMemo, useState } from "react";
import { initialData } from "@/lib/constants";
import { AppDataStorageAdapter } from "@/lib/storage";
import type { AppData, StorageInfo } from "@/lib/types";

export function usePersistedAppData() {
  const storage = useMemo(() => new AppDataStorageAdapter(), []);
  const [data, setData] = useState<AppData>(initialData);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState("");
  const [online, setOnline] = useState(true);
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({ usage: 0, quota: 0, persisted: false });

  useEffect(() => {
    void (async () => {
      try {
        const { value, migrated, migratedFrom } = await storage.load();
        if (value) setData(value);
        if (migrated) {
          setToast(
            migratedFrom
              ? `اطلاعات نسخه ${migratedFrom.toLocaleString("fa-IR")} با موفقیت منتقل شد`
              : "اطلاعات نسخه قبلی با موفقیت منتقل شد",
          );
        }
        setStorageInfo(await storage.estimate());
      } catch {
        setToast("خواندن اطلاعات قبلی ممکن نشد؛ از بخش تنظیمات فایل پشتیبان را بازیابی کنید");
      } finally {
        setReady(true);
      }
    })();
  }, [storage]);

  useEffect(() => {
    if (!ready) return;
    const id = window.setTimeout(() => {
      void storage.save(data).then(async () => setStorageInfo(await storage.estimate()));
    }, 220);
    return () => window.clearTimeout(id);
  }, [data, ready, storage]);

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

  return { data, setData, ready, toast, setToast, online, storageInfo, setStorageInfo, storage };
}
