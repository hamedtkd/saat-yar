"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import {
  DEFAULT_CALENDAR_PREFERENCE,
  DEFAULT_LOCALE,
  getBrowserCalendarPreference,
  getBrowserLocale,
  getLocaleDirection,
  resolveCalendarSystem,
  setBrowserCalendarPreference,
  setBrowserLocale,
  subscribeBrowserCalendarPreference,
  subscribeBrowserLocale,
  translate,
  type CalendarPreference,
  type CalendarSystem,
  type Locale,
  type MessageKey,
  type MessageParams,
} from "@/lib/i18n";

type LocaleContextValue = {
  locale: Locale;
  direction: "rtl" | "ltr";
  calendarPreference: CalendarPreference;
  calendar: CalendarSystem;
  setLocale: (locale: Locale) => void;
  setCalendarPreference: (preference: CalendarPreference) => void;
  t: (key: MessageKey, params?: MessageParams) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribeBrowserLocale, getBrowserLocale, () => DEFAULT_LOCALE);
  const calendarPreference = useSyncExternalStore(
    subscribeBrowserCalendarPreference,
    getBrowserCalendarPreference,
    () => DEFAULT_CALENDAR_PREFERENCE,
  );
  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    direction: getLocaleDirection(locale),
    calendarPreference,
    calendar: resolveCalendarSystem(locale, calendarPreference),
    setLocale: setBrowserLocale,
    setCalendarPreference: setBrowserCalendarPreference,
    t: (key, params) => translate(locale, key, params),
  }), [calendarPreference, locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LocaleProvider");
  return context;
}
