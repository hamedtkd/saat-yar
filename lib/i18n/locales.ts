export const supportedLocales = ["fa-IR", "en"] as const;

export type Locale = (typeof supportedLocales)[number];
export type Direction = "rtl" | "ltr";

export const DEFAULT_LOCALE: Locale = "fa-IR";
export const LOCALE_STORAGE_KEY = "saatyar-locale-v1";
export const LOCALE_CHANGE_EVENT = "saatyar:locale-change";

export function normalizeLocale(value: unknown): Locale {
  return value === "en" ? "en" : DEFAULT_LOCALE;
}

export function getLocaleDirection(locale: Locale): Direction {
  return locale === "en" ? "ltr" : "rtl";
}

export function getHtmlLang(locale: Locale) {
  return locale === "en" ? "en" : "fa";
}
