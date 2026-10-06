"use client";

import { useEffect, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import { localDateKey } from "@/lib/format";
import { createSessionHeartbeat, SESSION_HEARTBEAT_INTERVAL_MS, SESSION_HEARTBEAT_KEY } from "@/lib/session-close";
import type { AppData } from "@/lib/types";
import type { SaveState } from "./use-persisted-app-data";

export function usePersistedBrowserEffects({ ready, latestDataRef, saveState, toast, setOnline, setToast }: {
  ready: boolean;
  latestDataRef: MutableRefObject<AppData>;
  saveState: SaveState;
  toast: string;
  setOnline: Dispatch<SetStateAction<boolean>>;
  setToast: Dispatch<SetStateAction<string>>;
}) {
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
  }, [latestDataRef, ready]);

  useEffect(() => {
    if (!ready) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (saveState !== "saving") return;
      event.preventDefault();
      event.returnValue = "";
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
  }, [setOnline]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(id);
  }, [setToast, toast]);
}
