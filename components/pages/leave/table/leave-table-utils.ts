import { formatLocaleDate, formatLocaleDuration } from "@/lib/i18n/formatters";
import type { CalendarSystem } from "@/lib/i18n/calendars";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import { translateBusiness } from "@/lib/i18n/business";
import type { LeaveEntry } from "@/lib/types";

export function getLeaveTypeLabel(type: LeaveEntry["type"], locale: Locale = DEFAULT_LOCALE) {
  if (type === "full") return translateBusiness(locale, "leave.type.full");
  if (type === "half") return translateBusiness(locale, "leave.type.half");
  return translateBusiness(locale, "leave.type.hourly");
}

export function getLeaveDurationLabel(entry: LeaveEntry, locale: Locale = DEFAULT_LOCALE) {
  if (entry.type === "hourly") return formatLocaleDuration(locale, entry.minutes);
  if (entry.type === "half") return translateBusiness(locale, "leave.type.half");
  return translateBusiness(locale, "leave.duration.oneDay");
}

export function formatLeaveDate(value: string, locale: Locale = DEFAULT_LOCALE, calendar: CalendarSystem = "persian") {
  return formatLocaleDate(locale, value, { day: "numeric", month: "long", year: "numeric" }, calendar);
}
