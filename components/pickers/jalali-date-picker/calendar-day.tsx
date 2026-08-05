import { cn } from "@/lib/cn";
import { fa, jalali } from "@/lib/format";
import { getHolidayInfo } from "@/lib/holidays";

import type { CalendarDayCell, HolidayOptions } from "./types";

type CalendarDayProps = {
  cell: CalendarDayCell;
  value: string;
  today: string;
  isRecorded: boolean;
  holidayOptions: HolidayOptions;
  onSelect: (date: string) => void;
};

export function CalendarDay({
  cell,
  value,
  today,
  isRecorded,
  holidayOptions,
  onSelect,
}: CalendarDayProps) {
  const isSelected = cell.key === value;
  const isToday = cell.key === today;
  const holiday = getHolidayInfo(cell.key, {
    mode: holidayOptions.mode,
    includeOfficialHolidays: holidayOptions.includeOfficialHolidays,
    includeWeeklyHoliday: holidayOptions.includeWeeklyHoliday,
    overrides: holidayOptions.holidayOverrides,
  });

  return (
    <button
      type="button"
      aria-label={jalali(cell.key, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
      aria-pressed={isSelected}
      title={holiday.title}
      className={cn(
        "relative aspect-square min-w-0 rounded-xl border border-transparent",
        "bg-transparent text-sm font-bold text-[#102a3a] transition-colors duration-150",
        "hover:bg-[#edf9f4] focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-[#079b60]/30",
        !cell.inMonth && "text-[#b7c2c6]",
        holiday.isHoliday &&
          !isSelected &&
          "border-red-200 bg-red-50 text-red-600 hover:bg-red-100",
        isToday && !isSelected && "border-[#70c4a8]",
        isSelected && "border-[#079b60] bg-[#079b60] text-white hover:bg-[#079b60]",
      )}
      onClick={() => onSelect(cell.key)}
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
            "absolute bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full",
            isSelected ? "bg-white" : "bg-[#079b60]",
          )}
        />
      )}
    </button>
  );
}
