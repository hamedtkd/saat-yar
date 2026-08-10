import { cn } from "@/lib/cn";
import { formatLocaleDate, formatLocaleDigits } from "@/lib/i18n/formatters";
import { translate } from "@/lib/i18n/catalog";
import type { Locale } from "@/lib/i18n/locales";
import { getHolidayInfo } from "@/lib/holidays";
import { isScheduledDayOff } from "@/lib/work-schedule";

import type { CalendarDayCell, HolidayOptions } from "./types";

type CalendarDayProps = {
  locale: Locale;
  cell: CalendarDayCell;
  value: string;
  today: string;
  isRecorded: boolean;
  holidayOptions: HolidayOptions;
  onSelect: (date: string) => void;
};

export function CalendarDay({
  locale,
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
  const holidayTitle = holiday.isHoliday
    ? locale === "fa-IR"
      ? holiday.title
      : translate(locale, "common.holiday")
    : scheduledDayOff
      ? translate(locale, "picker.date.scheduledOff")
      : undefined;

  return (
    <button
      type="button"
      aria-label={formatLocaleDate(locale, cell.key, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
      aria-pressed={isSelected}
      title={holidayTitle}
      className={cn(
        "relative aspect-square min-w-0 rounded-xl border border-transparent",
        "bg-transparent text-sm font-bold text-[var(--text)] transition-colors duration-150",
        "hover:bg-[var(--accent-soft)] focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-[var(--accent-soft)]",
        !cell.inMonth && "opacity-35",
        holiday.isHoliday && "text-[var(--danger)]",
        scheduledDayOff && !holiday.isHoliday && "text-[var(--warning)]",
        isToday && "border-[var(--accent)]",
        isSelected && "border-[var(--accent-fill)] bg-[var(--accent-fill)] text-[var(--accent-foreground)] hover:bg-[var(--accent-fill)]",
      )}
      onClick={() => onSelect(cell.key)}
    >
      {formatLocaleDigits(locale, cell.day)}
      {isRecorded && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-[var(--accent-strong)]",
            isSelected && "bg-[var(--accent-foreground)]",
          )}
        />
      )}
    </button>
  );
}
