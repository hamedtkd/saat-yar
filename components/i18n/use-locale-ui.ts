"use client";

import { useMemo } from "react";
import { useLocale } from "./locale-provider";
import {
  formatLocaleDate,
  formatLocaleDigits,
  formatLocaleDuration,
  formatLocaleDurationSeconds,
  formatLocaleMoney,
  formatLocaleNumber,
  formatLocalePercent,
  formatLocaleTime,
} from "@/lib/i18n/formatters";

export function useLocaleUi() {
  const context = useLocale();
  const locale = context.locale;

  return useMemo(() => ({
    ...context,
    number: (value: number) => formatLocaleNumber(locale, value),
    digits: (value: string | number) => formatLocaleDigits(locale, value),
    duration: (value: number, signed = false) => formatLocaleDuration(locale, value, signed),
    durationSeconds: (value: number) => formatLocaleDurationSeconds(locale, value),
    money: (value: number) => formatLocaleMoney(locale, value),
    percent: (value: number) => formatLocalePercent(locale, value),
    date: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => formatLocaleDate(locale, value, options),
    time: (value: Date | string | number) => formatLocaleTime(locale, value),
  }), [context, locale]);
}
