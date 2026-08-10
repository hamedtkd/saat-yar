"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import {
  DEFAULT_LOCALE,
  getBrowserLocale,
  getLocaleDirection,
  setBrowserLocale,
  subscribeBrowserLocale,
  translate,
  type Locale,
  type MessageKey,
  type MessageParams,
} from "@/lib/i18n";

type LocaleContextValue = {
  locale: Locale;
  direction: "rtl" | "ltr";
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, params?: MessageParams) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribeBrowserLocale, getBrowserLocale, () => DEFAULT_LOCALE);
  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    direction: getLocaleDirection(locale),
    setLocale: setBrowserLocale,
    t: (key, params) => translate(locale, key, params),
  }), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LocaleProvider");
  return context;
}
