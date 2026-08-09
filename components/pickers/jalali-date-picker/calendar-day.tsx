import { cn } from "@/lib/cn";
import { fa, jalali } from "@/lib/format";
import { getHolidayInfo } from "@/lib/holidays";
import { isScheduledDayOff } from "@/lib/work-schedule";

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
  const weeklySchedule = holidayOptions.weeklySchedule;
  const scheduledDayOff = weeklySchedule
    ? isScheduledDayOff(cell.key, { weeklySchedule })
    : false;
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
      title={holiday.title ?? (scheduledDayOff ? "تعطیل طبق برنامه کاری" : undefined)}
      className={cn(
        "relative aspect-square min-w-0 rounded-xl border border-transparent",
        "bg-transparent text-sm font-bold text-[var(--text)] transition-colors duration-150",
        "hover:bg-[var(--accent-soft)] focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-[var(--accent-soft)]",
        !cell.inMonth && "text-[var(--text-muted)] opacity-45",
        holiday.isHoliday &&
          !isSelected &&
          "border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)] hover:brightness-95",
        scheduledDayOff &&
          !holiday.isHoliday &&
          !isSelected &&
          "border-[color-mix(in_srgb,var(--warning)_55%,var(--border))] bg-[var(--warning-soft)] text-[var(--warning)] hover:brightness-95",
        isToday && !isSelected && "border-[var(--accent)]",
        isSelected && "border-[var(--accent)] bg-[var(--accent-fill)] text-[var(--accent-foreground)] hover:brightness-105",
      )}
      onClick={() => onSelect(cell.key)}
    >
      {fa.format(cell.day)}
      {holiday.isHoliday && !isSelected && (
        <span
          aria-hidden="true"
          className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[var(--danger)]"
        />
      )}
      {scheduledDayOff && !holiday.isHoliday && !isSelected && (
        <span
          aria-hidden="true"
          className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[var(--warning)]"
        />
      )}
      {isRecorded && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full",
            isSelected ? "bg-[var(--accent-foreground)]" : "bg-[var(--accent-fill)]",
          )}
        />
      )}
    </button>
  );
}
