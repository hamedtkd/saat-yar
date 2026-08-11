import { translate, type MessageKey } from "@/lib/i18n/catalog";
import type { CalendarSystem } from "@/lib/i18n/calendars";
import type { Locale } from "@/lib/i18n/locales";
import { CalendarDay } from "./calendar-day";
import type { CalendarDayCell, HolidayOptions } from "./types";

const WEEK_DAY_KEYS: MessageKey[] = [
  "weekday.sat.short",
  "weekday.sun.short",
  "weekday.mon.short",
  "weekday.tue.short",
  "weekday.wed.short",
  "weekday.thu.short",
  "weekday.fri.short",
];

type CalendarGridProps = {
  locale: Locale;
  calendar: CalendarSystem;
  cells: CalendarDayCell[];
  value: string;
  today: string;
  recorded: Set<string>;
  holidayOptions: HolidayOptions;
  onSelect: (date: string) => void;
};

export function CalendarGrid({
  locale,
  calendar,
  cells,
  value,
  today,
  recorded,
  holidayOptions,
  onSelect,
}: CalendarGridProps) {
  return (
    <>
      <div className="grid grid-cols-7 gap-1.5">
        {WEEK_DAY_KEYS.map((key) => (
          <span
            key={key}
            className="py-2 text-center text-[10px] font-bold text-[var(--text-muted)]"
          >
            {translate(locale, key)}
          </span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1.5">
        {cells.map((cell) => (
          <CalendarDay
            key={cell.key}
            locale={locale}
            calendar={calendar}
            cell={cell}
            value={value}
            today={today}
            isRecorded={recorded.has(cell.key)}
            holidayOptions={holidayOptions}
            onSelect={onSelect}
          />
        ))}
      </div>
    </>
  );
}
