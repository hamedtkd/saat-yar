"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { APP_SYNC_CHANNEL, createDataSavedMessage, createTabId, isAppSyncMessage } from "@/lib/multi-tab-sync";
import { addSyncEvent, clearSyncHistory, createInitialSyncStatus } from "@/lib/multi-tab-sync-status";
import { hasUnsavedSettingsDrafts } from "@/lib/settings-draft-registry";
import type { AppDataStorageAdapter } from "@/lib/storage";
import type { AppData } from "@/lib/types";
import type { SaveState } from "./use-persisted-app-data";

type Params = {
  ready: boolean;
  saveState: SaveState;
  storage: AppDataStorageAdapter;
  setData: (value: AppData) => void;
  setToast: (message: string) => void;
};

export function useMultiTabDataSync({ ready, saveState, storage, setData, setToast }: Params) {
  const [externalSyncPending, setExternalSyncPending] = useState(false);
  const [multiTabSyncStatus, setMultiTabSyncStatus] = useState(createInitialSyncStatus);
  const tabIdRef = useRef("");
  const channelRef = useRef<BroadcastChannel | null>(null);
  const skipNextPersistRef = useRef(false);

  const consumeSkipNextPersist = useCallback(() => {
    if (!skipNextPersistRef.current) return false;
    skipNextPersistRef.current = false;
    return true;
  }, []);

  const publishSaved = useCallback((savedAt: Date) => {
    channelRef.current?.postMessage(createDataSavedMessage(tabIdRef.current, savedAt));
  }, []);

  const loadExternalData = useCallback(async () => {
    if (hasUnsavedSettingsDrafts()) {
      setToast("ابتدا تغییرات در حال ویرایش را ذخیره یا لغو کنید");
      return false;
    }
    const { value } = await storage.load();
    if (!value) return false;
    skipNextPersistRef.current = true;
    setData(value);
    setExternalSyncPending(false);
    setMultiTabSyncStatus((current) => ({ ...current, pending: false }));
    setToast("تغییرات تب دیگر بارگذاری شد");
    return true;
  }, [setData, setToast, storage]);

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
      const pending = hasUnsavedSettingsDrafts() || saveState === "saving";
      setMultiTabSyncStatus((current) => addSyncEvent(current, {
        kind: pending ? "deferred" : "loaded",
        sourceTabId: event.data.tabId,
        savedAt: event.data.savedAt,
        receivedAt,
      }));
      if (pending) {
        setExternalSyncPending(true);
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
  }, [loadExternalData, ready, saveState]);

  return {
    externalSyncPending,
    multiTabSyncStatus,
    publishSaved,
    consumeSkipNextPersist,
    reloadExternalData: loadExternalData,
    dismissExternalSync: () => setExternalSyncPending(false),
    clearMultiTabSyncHistory: () => setMultiTabSyncStatus(clearSyncHistory),
  };
}
