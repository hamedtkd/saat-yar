"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  PROJECT_TIMER_SESSION_CHANGE_EVENT,
  PROJECT_TIMER_SESSION_STORAGE_KEY,
  type ProjectTimerSession,
  parseProjectTimerSession,
  writeProjectTimerSession,
} from "@/lib/project-timer-session";

let cachedRaw: string | null | undefined;
let cachedValue: ProjectTimerSession | null = null;

function getStorage() {
  try { return window.localStorage; } catch { return undefined; }
}

function getSnapshot() {
  const storage = getStorage();
  const raw = storage?.getItem(PROJECT_TIMER_SESSION_STORAGE_KEY) ?? null;
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parseProjectTimerSession(raw);
  }
  return cachedValue;
}

function subscribe(listener: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === PROJECT_TIMER_SESSION_STORAGE_KEY) listener();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(PROJECT_TIMER_SESSION_CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(PROJECT_TIMER_SESSION_CHANGE_EVENT, listener);
  };
}

export function useProjectTimerSession() {
  const session = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const setSession = useCallback((next: ProjectTimerSession | null) => {
    writeProjectTimerSession(next, getStorage());
    cachedRaw = undefined;
    window.dispatchEvent(new Event(PROJECT_TIMER_SESSION_CHANGE_EVENT));
  }, []);
  return { session, setSession };
}
