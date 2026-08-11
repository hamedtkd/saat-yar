import type { Locale } from "./locales.ts";
import { translateSystem, type SystemMessageKey } from "./system.ts";

const PERSIAN_SCRIPT = /[\u0600-\u06ff]/;
const LATIN_SCRIPT = /[A-Za-z]/;

export function localizeSystemRuntimeError(locale: Locale, value: unknown, fallback: SystemMessageKey) {
  if (!(value instanceof Error) || !value.message.trim()) return translateSystem(locale, fallback);
  if (locale === "en" && PERSIAN_SCRIPT.test(value.message)) return translateSystem(locale, fallback);
  if (locale === "fa-IR" && !PERSIAN_SCRIPT.test(value.message) && LATIN_SCRIPT.test(value.message)) return translateSystem(locale, fallback);
  return value.message;
}
