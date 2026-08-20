import { getCalendarLocale, type CalendarSystem } from "./calendars.ts";
import type { Locale } from "./locales.ts";

const numberFormatters: Record<Locale, Intl.NumberFormat> = {
  "fa-IR": new Intl.NumberFormat("fa-IR"),
  en: new Intl.NumberFormat("en-US"),
};

export function formatLocaleNumber(locale: Locale, value: number, options?: Intl.NumberFormatOptions) {
  return options ? new Intl.NumberFormat(locale === "fa-IR" ? "fa-IR" : "en-US", options).format(value) : numberFormatters[locale].format(value);
}

export function formatLocaleDigits(locale: Locale, value: string | number) {
  if (locale === "en") return String(value).replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

export function formatLocaleDuration(locale: Locale, value: number, signed = false) {
  const sign = value < 0 ? "−" : signed && value > 0 ? "+" : "";
  const minutes = Math.abs(Math.round(value));
  const hours = Math.floor(minutes / 60);
  const remainder = String(minutes % 60).padStart(2, "0");
  return `${sign}${formatLocaleNumber(locale, hours)}:${formatLocaleDigits(locale, remainder)}`;
}

export function formatLocaleDurationWords(locale: Locale, value: number) {
  const minutes = Math.max(0, Math.round(value));
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  const n = (v: number) => formatLocaleNumber(locale, v);
  if (locale === "en") {
    if (!hours) return `${n(remainder)} minutes`;
    if (!remainder) return `${n(hours)} hours`;
    return `${n(hours)} hours and ${n(remainder)} minutes`;
  }
  if (!hours) return `${n(remainder)} دقیقه`;
  if (!remainder) return `${n(hours)} ساعت`;
  return `${n(hours)} ساعت و ${n(remainder)} دقیقه`;
}

export function formatLocaleDurationSeconds(locale: Locale, value: number) {
  const seconds = Math.max(0, Math.floor(value));
  const hours = Math.floor(seconds / 3600);
  const minutes = String(Math.floor(seconds / 60) % 60).padStart(2, "0");
  const remainder = String(seconds % 60).padStart(2, "0");
  return `${formatLocaleNumber(locale, hours)}:${formatLocaleDigits(locale, minutes)}:${formatLocaleDigits(locale, remainder)}`;
}

export function formatLocaleMoney(locale: Locale, value: number) {
  return formatLocaleNumber(locale, Math.round(value));
}

export function formatLocalePercent(locale: Locale, value: number) {
  return new Intl.NumberFormat(locale === "fa-IR" ? "fa-IR" : "en-US", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value / 100);
}

function orderedWeekdayDate(
  locale: Locale,
  formatter: Intl.DateTimeFormat,
  date: Date,
  options?: Intl.DateTimeFormatOptions,
) {
  if (!options?.weekday || !options.day || !options.month) return formatter.format(date);

  const parts = formatter.formatToParts(date);
  const valueOf = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  const weekday = valueOf("weekday");
  const day = valueOf("day");
  const month = valueOf("month");
  const year = options.year ? valueOf("year") : "";
  const era = valueOf("era");

  if (locale === "fa-IR") {
    return `${weekday}، ${day} ${month}${year ? ` ${year}` : ""}${era ? ` ${era}` : ""}`;
  }

  return `${weekday}, ${month} ${day}${year ? `, ${year}` : ""}${era ? ` ${era}` : ""}`;
}

export function formatLocaleDate(
  locale: Locale,
  value: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
  calendar: CalendarSystem = "persian",
) {
  const date = value instanceof Date
    ? value
    : typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T12:00:00`)
      : new Date(value);
  const formatter = new Intl.DateTimeFormat(
    getCalendarLocale(locale, calendar),
    options ?? { year: "numeric", month: "2-digit", day: "2-digit" },
  );
  return orderedWeekdayDate(locale, formatter, date, options);
}

export function formatLocaleTime(locale: Locale, value: Date | string | number) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(locale === "fa-IR" ? "fa-IR" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
