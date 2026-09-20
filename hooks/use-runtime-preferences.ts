"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  DEFAULT_RUNTIME_PREFERENCES,
  RUNTIME_PREFERENCES_CHANGE_EVENT,
  RUNTIME_PREFERENCES_STORAGE_KEY,
  readRuntimePreferences,
  writeRuntimePreferences,
  type RuntimePreferences,
} from "@/lib/runtime-preferences";

let cachedRaw: string | null | undefined;
let cachedValue = DEFAULT_RUNTIME_PREFERENCES;

function getStorage() {
  try { return window.localStorage; } catch { return undefined; }
}

function getSnapshot() {
  const storage = getStorage();
  const raw = storage?.getItem(RUNTIME_PREFERENCES_STORAGE_KEY) ?? null;
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = readRuntimePreferences(storage);
  }
  return cachedValue;
}

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === RUNTIME_PREFERENCES_STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(RUNTIME_PREFERENCES_CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(RUNTIME_PREFERENCES_CHANGE_EVENT, listener);
  };
}

export function useRuntimePreferences() {
  const value = useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_RUNTIME_PREFERENCES);
  const update = useCallback((patch: Partial<RuntimePreferences>) => {
    const next = { ...getSnapshot(), ...patch };
    writeRuntimePreferences(next, getStorage());
    cachedRaw = undefined;
    window.dispatchEvent(new Event(RUNTIME_PREFERENCES_CHANGE_EVENT));
  }, []);
  return { value, update };
}
