import { formatLocaleDate } from "./i18n/formatters.ts";
import type { CalendarSystem } from "./i18n/calendars.ts";
import type { Locale } from "./i18n/locales.ts";

const REPORT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
};

const searchDateCache = new Map<string, string[]>();

export function formatEmployeeReportDate(date: string, locale: Locale, calendar: CalendarSystem) {
  return formatLocaleDate(locale, date, REPORT_DATE_OPTIONS, calendar);
}

export function getEmployeeReportDateSearchVariants(date: string) {
  const cached = searchDateCache.get(date);
  if (cached) return cached;
  const variants = [
    formatEmployeeReportDate(date, "fa-IR", "persian"),
    formatEmployeeReportDate(date, "fa-IR", "gregory"),
    formatEmployeeReportDate(date, "en", "persian"),
    formatEmployeeReportDate(date, "en", "gregory"),
  ];
  if (searchDateCache.size >= 500) searchDateCache.delete(searchDateCache.keys().next().value ?? "");
  searchDateCache.set(date, variants);
  return variants;
}
