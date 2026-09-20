export const RUNTIME_PREFERENCES_STORAGE_KEY = "saatyar:runtime-preferences-v1";
export const RUNTIME_PREFERENCES_CHANGE_EVENT = "saatyar:runtime-preferences-change";

export type RuntimePreferences = {
  pauseTimersOnSystemSuspend: boolean;
  autoStartConfigured: boolean;
};

export const DEFAULT_RUNTIME_PREFERENCES: RuntimePreferences = {
  pauseTimersOnSystemSuspend: true,
  autoStartConfigured: false,
};

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function parseRuntimePreferences(raw: string | null): RuntimePreferences {
  if (!raw) return { ...DEFAULT_RUNTIME_PREFERENCES };
  try {
    const value = JSON.parse(raw) as Partial<RuntimePreferences>;
    return {
      pauseTimersOnSystemSuspend: value.pauseTimersOnSystemSuspend !== false,
      autoStartConfigured: value.autoStartConfigured === true,
    };
  } catch {
    return { ...DEFAULT_RUNTIME_PREFERENCES };
  }
}

export function readRuntimePreferences(storage?: Pick<StorageLike, "getItem">) {
  if (!storage) return { ...DEFAULT_RUNTIME_PREFERENCES };
  try {
    return parseRuntimePreferences(storage.getItem(RUNTIME_PREFERENCES_STORAGE_KEY));
  } catch {
    return { ...DEFAULT_RUNTIME_PREFERENCES };
  }
}

export function writeRuntimePreferences(value: RuntimePreferences, storage?: StorageLike) {
  if (!storage) return;
  storage.setItem(RUNTIME_PREFERENCES_STORAGE_KEY, JSON.stringify(value));
}
