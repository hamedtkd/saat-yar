import { useMemo, useState } from "react";

import { jalaliMonthCells, localDateKey, shiftJalaliMonth } from "@/lib/format";
import { formatLocaleDate } from "@/lib/i18n/formatters";
import type { Locale } from "@/lib/i18n/locales";

import type { JalaliDatePickerProps } from "./types";

type PickerStateProps = Pick<
  JalaliDatePickerProps,
  "value" | "onChange" | "recordedDates" | "placeholder"
> & { locale: Locale };

export function useJalaliDatePicker({
  value,
  onChange,
  recordedDates = [],
  placeholder = "",
  locale,
}: PickerStateProps) {
  const today = localDateKey();
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || today);

  const cells = useMemo(() => jalaliMonthCells(viewDate), [viewDate]);
  const recorded = useMemo(() => new Set(recordedDates), [recordedDates]);
  const title = formatLocaleDate(locale, viewDate, { month: "long", year: "numeric" });
  const selectedLabel = value
    ? formatLocaleDate(locale, value, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : placeholder;

  const openPicker = () => {
    setViewDate(value || today);
    setOpen(true);
  };

  const closePicker = () => setOpen(false);
  const showPreviousMonth = () => setViewDate((current) => shiftJalaliMonth(current, -1));
  const showNextMonth = () => setViewDate((current) => shiftJalaliMonth(current, 1));

  const selectDate = (date: string) => {
    onChange(date);
    setOpen(false);
  };

  const selectToday = () => {
    onChange(today);
    setViewDate(today);
    setOpen(false);
  };

  return {
    open,
    today,
    cells,
    recorded,
    title,
    selectedLabel,
    openPicker,
    closePicker,
    showPreviousMonth,
    showNextMonth,
    selectDate,
    selectToday,
  };
}
