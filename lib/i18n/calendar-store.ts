import {
  CALENDAR_CHANGE_EVENT,
  CALENDAR_STORAGE_KEY,
  DEFAULT_CALENDAR_PREFERENCE,
  normalizeCalendarPreference,
  type CalendarPreference,
} from "./calendars.ts";

export function readStoredCalendarPreference(storage?: Pick<Storage, "getItem">): CalendarPreference {
  if (!storage) return DEFAULT_CALENDAR_PREFERENCE;
  try {
    return normalizeCalendarPreference(storage.getItem(CALENDAR_STORAGE_KEY));
  } catch {
    return DEFAULT_CALENDAR_PREFERENCE;
  }
}

export function getBrowserCalendarPreference(): CalendarPreference {
  if (typeof window === "undefined") return DEFAULT_CALENDAR_PREFERENCE;
  return readStoredCalendarPreference(window.localStorage);
}

export function setBrowserCalendarPreference(preference: CalendarPreference): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CALENDAR_STORAGE_KEY, preference);
  } catch {
    // Calendar switching remains usable even when storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent(CALENDAR_CHANGE_EVENT, { detail: preference }));
}

export function subscribeBrowserCalendarPreference(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === CALENDAR_STORAGE_KEY) onStoreChange();
  };
  const onCalendarChange = () => onStoreChange();
  window.addEventListener("storage", onStorage);
  window.addEventListener(CALENDAR_CHANGE_EVENT, onCalendarChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CALENDAR_CHANGE_EVENT, onCalendarChange);
  };
}
