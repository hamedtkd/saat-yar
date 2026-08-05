import { Check, X } from "lucide-react";
import { useId } from "react";

import { Button } from "@/components/ui/button";
import { useDialogAccessibility } from "@/hooks/accessibility/use-dialog-accessibility";
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
  const titleId = useId();
  const dialogRef = useDialogAccessibility(props.onClose);

  return (
    <>
      <button
        type="button"
        aria-label="بستن تقویم"
        className="fixed inset-0 z-[700] border-0 bg-black/45 backdrop-blur-[2px]"
        onClick={props.onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        dir="rtl"
        className={cn(
          "fixed top-1/2 left-1/2 z-[750] w-[min(430px,calc(100vw-24px))]",
          "max-h-[calc(100dvh-24px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto",
          "rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4",
          "shadow-[0_28px_90px_rgba(17,45,55,0.25)]",
        )}
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 id={titleId} className="text-sm font-extrabold text-[var(--text)]">
            انتخاب تاریخ
          </h2>
          <Button type="button" variant="ghost" size="icon" aria-label="بستن تقویم" onClick={props.onClose}>
            <X aria-hidden="true" />
          </Button>
        </div>
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
          className="mt-4 h-12 w-full rounded-xl bg-[var(--accent)] text-sm font-extrabold text-[var(--accent-foreground)] shadow-none hover:brightness-110"
        >
          <Check aria-hidden="true" className="size-4.5" />
          امروز
        </Button>
      </div>
    </>
  );
}
