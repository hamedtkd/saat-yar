export { translate, type MessageKey, type MessageParams } from "./catalog.ts";
export {
  DEFAULT_LOCALE,
  LOCALE_CHANGE_EVENT,
  LOCALE_STORAGE_KEY,
  getHtmlLang,
  getLocaleDirection,
  normalizeLocale,
  supportedLocales,
  type Direction,
  type Locale,
} from "./locales.ts";
export { getBrowserLocale, readStoredLocale, setBrowserLocale, subscribeBrowserLocale } from "./locale-store.ts";
