import type { Locale } from "./locales.ts";

export const calendarPreferences = ["auto", "persian", "gregory"] as const;
export type CalendarPreference = (typeof calendarPreferences)[number];
export type CalendarSystem = Exclude<CalendarPreference, "auto">;

export const DEFAULT_CALENDAR_PREFERENCE: CalendarPreference = "auto";
export const CALENDAR_STORAGE_KEY = "saatyar-calendar-v1";
export const CALENDAR_CHANGE_EVENT = "saatyar:calendar-change";

export function normalizeCalendarPreference(value: unknown): CalendarPreference {
  return value === "persian" || value === "gregory" ? value : DEFAULT_CALENDAR_PREFERENCE;
}

export function resolveCalendarSystem(locale: Locale, preference: CalendarPreference): CalendarSystem {
  if (preference === "persian" || preference === "gregory") return preference;
  return locale === "en" ? "gregory" : "persian";
}

export function getCalendarLocale(locale: Locale, calendar: CalendarSystem) {
  const languageLocale = locale === "en" ? "en-US" : "fa-IR";
  return `${languageLocale}-u-ca-${calendar}`;
}
