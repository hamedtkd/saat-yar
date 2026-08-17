import type { ExternalCalendarPreferences } from "./types.ts";

export const EXTERNAL_CALENDAR_PREFERENCES_KEY = "saatyar-external-calendar-v1";
export const EXTERNAL_CALENDAR_PREFERENCES_EVENT = "saatyar:external-calendar-preferences";

export const DEFAULT_EXTERNAL_CALENDAR_PREFERENCES: ExternalCalendarPreferences = {
  version: 1,
  provider: "google",
  selectedCalendarIds: [],
};

let cachedRaw: string | null | undefined;
let cachedPreferences = DEFAULT_EXTERNAL_CALENDAR_PREFERENCES;

export function normalizeExternalCalendarPreferences(value: unknown): ExternalCalendarPreferences {
  if (!value || typeof value !== "object") return DEFAULT_EXTERNAL_CALENDAR_PREFERENCES;
  const candidate = value as Partial<ExternalCalendarPreferences>;
  const selectedCalendarIds = Array.isArray(candidate.selectedCalendarIds)
    ? [...new Set(candidate.selectedCalendarIds.filter((item): item is string => typeof item === "string" && item.length > 0))]
    : [];
  return { version: 1, provider: "google", selectedCalendarIds };
}

export function readExternalCalendarPreferences(storage?: Pick<Storage, "getItem">): ExternalCalendarPreferences {
  const target = storage ?? (typeof window === "undefined" ? undefined : window.localStorage);
  if (!target) return DEFAULT_EXTERNAL_CALENDAR_PREFERENCES;
  try {
    const raw = target.getItem(EXTERNAL_CALENDAR_PREFERENCES_KEY);
    if (!storage && raw === cachedRaw) return cachedPreferences;
    const next = raw ? normalizeExternalCalendarPreferences(JSON.parse(raw)) : DEFAULT_EXTERNAL_CALENDAR_PREFERENCES;
    if (!storage) {
      cachedRaw = raw;
      cachedPreferences = next;
    }
    return next;
  } catch {
    return DEFAULT_EXTERNAL_CALENDAR_PREFERENCES;
  }
}

export function writeExternalCalendarPreferences(
  preferences: ExternalCalendarPreferences,
  storage?: Pick<Storage, "setItem">,
) {
  const target = storage ?? (typeof window === "undefined" ? undefined : window.localStorage);
  if (!target) return;
  const normalized = normalizeExternalCalendarPreferences(preferences);
  const raw = JSON.stringify(normalized);
  target.setItem(EXTERNAL_CALENDAR_PREFERENCES_KEY, raw);
  if (!storage && typeof window !== "undefined") {
    cachedRaw = raw;
    cachedPreferences = normalized;
    window.dispatchEvent(new Event(EXTERNAL_CALENDAR_PREFERENCES_EVENT));
  }
}

export function subscribeExternalCalendarPreferences(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const handleStorage = (event: StorageEvent) => {
    if (event.key === EXTERNAL_CALENDAR_PREFERENCES_KEY) {
      cachedRaw = undefined;
      callback();
    }
  };
  window.addEventListener(EXTERNAL_CALENDAR_PREFERENCES_EVENT, callback);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(EXTERNAL_CALENDAR_PREFERENCES_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
}
