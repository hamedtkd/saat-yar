"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fa, jalali, jalaliMonthCells, localDateKey, shiftJalaliMonth } from "@/lib/format";
import { cn } from "@/lib/cn";

export function JalaliDatePicker({ value, onChange, recordedDates = [] }: {
  value: string;
  onChange: (value: string) => void;
  recordedDates?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value);
  useEffect(() => setViewDate(value), [value]);
  const cells = useMemo(() => jalaliMonthCells(viewDate), [viewDate]);
  const recorded = useMemo(() => new Set(recordedDates), [recordedDates]);
  const title = jalali(viewDate, { month: "long", year: "numeric" });

  return (
    <div className="date-popover relative min-w-0">
      <Button
        variant="outline"
        className="grid h-[52px] min-w-[250px] grid-cols-[auto_minmax(0,1fr)_auto] gap-[10px] text-right max-[620px]:min-w-0"
        onClick={() => setOpen(true)}
      >
        <CalendarDays className="text-[#079b60]" />
        <span className="grid min-w-0">
          <small className="text-[9px] text-[#6c7d89]">تاریخ انتخاب‌شده</small>
          <strong className="overflow-hidden text-ellipsis text-[11px]">{jalali(value, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</strong>
        </span>
        <ChevronDown />
      </Button>
      {open && (
        <>
          <button aria-label="بستن تقویم" className="fixed inset-0 z-[700] border-0 bg-[#0a1f27]/15 backdrop-blur-[1px]" onClick={() => setOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-[750] max-h-[calc(100vh-24px)] w-[min(360px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[15px] border border-[#dfe7e9] bg-white p-[14px] shadow-[0_24px_80px_rgba(17,45,55,.24)]">
            <div className="mb-[10px] flex items-center justify-between gap-[10px]">
              <Button variant="outline" size="icon" onClick={() => setViewDate(shiftJalaliMonth(viewDate, -1))}><ChevronRight /></Button>
              <strong>{title}</strong>
              <Button variant="outline" size="icon" onClick={() => setViewDate(shiftJalaliMonth(viewDate, 1))}><ChevronLeft /></Button>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {["ش", "ی", "د", "س", "چ", "پ", "ج"].map((day) => <span className="py-[5px] text-center text-[10px] text-[#6c7d89]" key={day}>{day}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((cell) => (
                <button
                  type="button"
                  key={cell.key}
                  className={cn(
                    "relative aspect-square rounded-[9px] border-0 bg-transparent text-[#102a3a] hover:bg-[#edf9f4]",
                    !cell.inMonth && "text-[#b7c2c6]",
                    cell.key === localDateKey() && "shadow-[inset_0_0_0_1px_#70c4a8]",
                    cell.key === value && "bg-[#079b60] text-white hover:bg-[#079b60]",
                  )}
                  onClick={() => { onChange(cell.key); setOpen(false); }}
                >
                  {fa.format(cell.day)}
                  {recorded.has(cell.key) && <i className={cn("absolute bottom-[3px] right-1/2 h-1 w-1 translate-x-1/2 rounded-full bg-[#079b60]", cell.key === value && "bg-white")} />}
                </button>
              ))}
            </div>
            <Button className="mt-[10px] w-full" onClick={() => { onChange(localDateKey()); setOpen(false); }}><Check /> امروز</Button>
          </div>
        </>
      )}
    </div>
  );
}
