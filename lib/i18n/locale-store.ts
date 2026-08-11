import {
  DEFAULT_LOCALE,
  LOCALE_CHANGE_EVENT,
  LOCALE_STORAGE_KEY,
  normalizeLocale,
  type Locale,
} from "./locales.ts";

export function readStoredLocale(storage?: Pick<Storage, "getItem">): Locale {
  if (!storage) return DEFAULT_LOCALE;
  try {
    return normalizeLocale(storage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function getBrowserLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  return readStoredLocale(window.localStorage);
}

export function setBrowserLocale(locale: Locale): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Locale switching remains usable even when storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent(LOCALE_CHANGE_EVENT, { detail: locale }));
}

export function subscribeBrowserLocale(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === LOCALE_STORAGE_KEY) onStoreChange();
  };
  const onLocaleChange = () => onStoreChange();
  window.addEventListener("storage", onStorage);
  window.addEventListener(LOCALE_CHANGE_EVENT, onLocaleChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LOCALE_CHANGE_EVENT, onLocaleChange);
  };
}
