import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

import { CalendarGrid } from "./calendar-grid";
import { CalendarHeader } from "./calendar-header";
import type { CalendarDayCell, HolidayOptions } from "./types";

type DatePickerDialogProps = {
  title: string;
  cells: CalendarDayCell[];
  value: string;
  today: string;
  recorded: Set<string>;
  holidayOptions: HolidayOptions;
  onClose: () => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSelect: (date: string) => void;
  onSelectToday: () => void;
};

export function DatePickerDialog(props: DatePickerDialogProps) {
  return (
    <>
      <button
        type="button"
        aria-label="بستن تقویم"
        className="fixed inset-0 z-[700] border-0 bg-[#0a1f27]/20 backdrop-blur-[2px]"
        onClick={props.onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="انتخاب تاریخ"
        dir="rtl"
        className={cn(
          "fixed top-1/2 left-1/2 z-[750] w-[min(430px,calc(100vw-24px))]",
          "max-h-[calc(100dvh-24px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto",
          "rounded-2xl border border-[#dfe7e9] bg-white p-4",
          "shadow-[0_28px_90px_rgba(17,45,55,0.25)]",
        )}
      >
        <CalendarHeader
          title={props.title}
          onPreviousMonth={props.onPreviousMonth}
          onNextMonth={props.onNextMonth}
        />
        <CalendarGrid
          cells={props.cells}
          value={props.value}
          today={props.today}
          recorded={props.recorded}
          holidayOptions={props.holidayOptions}
          onSelect={props.onSelect}
        />
        <Button
          type="button"
          onClick={props.onSelectToday}
          className={cn(
            "mt-4 h-14 w-full rounded-xl bg-[#0b4556]",
            "text-sm font-extrabold text-white shadow-none hover:bg-[#083b49]",
          )}
        >
          <Check aria-hidden="true" className="size-4.5" />
          امروز
        </Button>
      </div>
    </>
  );
}
