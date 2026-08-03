"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  fa,
  jalali,
  jalaliMonthCells,
  localDateKey,
  shiftJalaliMonth,
} from "@/lib/format";
import { cn } from "@/lib/cn";
import { getHolidayInfo } from "@/lib/holidays";
import type { Mode } from "@/lib/types";

type JalaliDatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  recordedDates?: string[];
  mode?: Mode;
  includeOfficialHolidays?: boolean;
  includeWeeklyHoliday?: boolean;
};

const WEEK_DAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

export function JalaliDatePicker({
  value,
  onChange,
  recordedDates = [],
  mode = "employee",
  includeOfficialHolidays = true,
  includeWeeklyHoliday = true,
}: JalaliDatePickerProps) {
  const today = localDateKey();

  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || today);

  const cells = useMemo(
    () => jalaliMonthCells(viewDate),
    [viewDate],
  );

  const recorded = useMemo(
    () => new Set(recordedDates),
    [recordedDates],
  );

  const title = jalali(viewDate, {
    month: "long",
    year: "numeric",
  });

  const selectedLabel = value
    ? jalali(value, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "انتخاب تاریخ";

  const handleOpen = () => {
    setViewDate(value || today);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handlePreviousMonth = () => {
    setViewDate((current) => shiftJalaliMonth(current, -1));
  };

  const handleNextMonth = () => {
    setViewDate((current) => shiftJalaliMonth(current, 1));
  };

  const handleSelectDate = (date: string) => {
    onChange(date);
    setOpen(false);
  };

  const handleSelectToday = () => {
    onChange(today);
    setViewDate(today);
    setOpen(false);
  };

  return (
    <div className="relative min-w-0 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={handleOpen}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "grid h-13 w-full min-w-0",
          "grid-cols-[auto_minmax(0,1fr)_auto]",
          "items-center gap-2.5",
          "rounded-xl border-[#d5e2e4]",
          "bg-white px-3 text-right",
          "shadow-none",
          "hover:bg-white",
          "focus-visible:border-[#079b60]",
          "focus-visible:ring-[#079b60]/15",
        )}
      >
        <CalendarDays
          aria-hidden="true"
          className="size-5 shrink-0 text-[#079b60]"
        />

        <span className="grid min-w-0 gap-0.5">
          <small className="text-[9px] font-medium text-[#6c7d89]">
            تاریخ انتخاب‌شده
          </small>

          <strong className="truncate text-[11px] font-extrabold text-[#102a3a]">
            {selectedLabel}
          </strong>
        </span>

        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-[#6c7d89]"
        />
      </Button>

      {open && (
        <>
          <button
            type="button"
            aria-label="بستن تقویم"
            className="fixed inset-0 z-[700] border-0 bg-[#0a1f27]/20 backdrop-blur-[2px]"
            onClick={handleClose}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="انتخاب تاریخ"
            dir="rtl"
            className={cn(
              "fixed top-1/2 left-1/2 z-[750]",
              "w-[min(430px,calc(100vw-24px))]",
              "max-h-[calc(100dvh-24px)]",
              "-translate-x-1/2 -translate-y-1/2",
              "overflow-y-auto",
              "rounded-2xl border border-[#dfe7e9]",
              "bg-white p-4",
              "shadow-[0_28px_90px_rgba(17,45,55,0.25)]",
            )}
          >
            <div className="mb-4 grid grid-cols-[52px_1fr_52px] items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="ماه قبل"
                onClick={handlePreviousMonth}
                className="size-13 rounded-xl border-[#d5e2e4] shadow-none"
              >
                <ChevronRight
                  aria-hidden="true"
                  className="size-5"
                />
              </Button>

              <strong className="text-center text-sm font-extrabold text-[#102a3a]">
                {title}
              </strong>

              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="ماه بعد"
                onClick={handleNextMonth}
                className="size-13 rounded-xl border-[#d5e2e4] shadow-none"
              >
                <ChevronLeft
                  aria-hidden="true"
                  className="size-5"
                />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {WEEK_DAYS.map((day) => (
                <span
                  key={day}
                  className="py-2 text-center text-[10px] font-bold text-[#6c7d89]"
                >
                  {day}
                </span>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1.5">
              {cells.map((cell) => {
                const isSelected = cell.key === value;
                const isToday = cell.key === today;
                const isRecorded = recorded.has(cell.key);
                const holiday = getHolidayInfo(cell.key, {
                  mode,
                  includeOfficialHolidays,
                  includeWeeklyHoliday,
                });

                return (
                  <button
                    type="button"
                    key={cell.key}
                    aria-label={jalali(cell.key, {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    aria-pressed={isSelected}
                    title={holiday.title}
                    className={cn(
                      "relative aspect-square min-w-0",
                      "rounded-xl border border-transparent",
                      "bg-transparent",
                      "text-sm font-bold text-[#102a3a]",
                      "transition-colors duration-150",
                      "hover:bg-[#edf9f4]",
                      "focus-visible:outline-none",
                      "focus-visible:ring-2",
                      "focus-visible:ring-[#079b60]/30",

                      !cell.inMonth &&
                        "text-[#b7c2c6]",

                      holiday.isHoliday &&
                        !isSelected &&
                        "border-red-200 bg-red-50 text-red-600 hover:bg-red-100",

                      isToday &&
                        !isSelected &&
                        "border-[#70c4a8]",

                      isSelected &&
                        "border-[#079b60] bg-[#079b60] text-white",

                      isSelected &&
                        "hover:bg-[#079b60]",
                    )}
                    onClick={() => handleSelectDate(cell.key)}
                  >
                    {fa.format(cell.day)}

                    {holiday.isHoliday && !isSelected && (
                      <span
                        aria-hidden="true"
                        className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-red-500"
                      />
                    )}

                    {isRecorded && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute bottom-1 left-1/2",
                          "size-1.5 -translate-x-1/2",
                          "rounded-full bg-[#079b60]",
                          isSelected && "bg-white",
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <Button
              type="button"
              onClick={handleSelectToday}
              className={cn(
                "mt-4 h-14 w-full rounded-xl",
                "bg-[#0b4556]",
                "text-sm font-extrabold text-white",
                "shadow-none",
                "hover:bg-[#083b49]",
              )}
            >
              <Check
                aria-hidden="true"
                className="size-4.5"
              />
              امروز
            </Button>
          </div>
        </>
      )}
    </div>
  );
}