import { useMemo, useState } from "react";

import {
  jalali,
  jalaliMonthCells,
  localDateKey,
  shiftJalaliMonth,
} from "@/lib/format";

import type { JalaliDatePickerProps } from "./types";

export function useJalaliDatePicker({
  value,
  onChange,
  recordedDates = [],
  placeholder = "انتخاب تاریخ",
}: Pick<
  JalaliDatePickerProps,
  "value" | "onChange" | "recordedDates" | "placeholder"
>) {
  const today = localDateKey();
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || today);

  const cells = useMemo(() => jalaliMonthCells(viewDate), [viewDate]);
  const recorded = useMemo(() => new Set(recordedDates), [recordedDates]);
  const title = jalali(viewDate, { month: "long", year: "numeric" });
  const selectedLabel = value
    ? jalali(value, {
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
  const showPreviousMonth = () =>
    setViewDate((current) => shiftJalaliMonth(current, -1));
  const showNextMonth = () =>
    setViewDate((current) => shiftJalaliMonth(current, 1));

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
