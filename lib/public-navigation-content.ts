import type { Locale } from "./i18n/locales.ts";

export function getPublicNavigationLabels(locale: Locale) {
  return locale === "en"
    ? { brand: "Saatyar", app: "Back to app", settings: "Settings", help: "Help" }
    : { brand: "ساعت‌یار", app: "بازگشت به اپ", settings: "تنظیمات", help: "راهنما" };
}
