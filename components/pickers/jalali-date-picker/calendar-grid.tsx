import { CalendarDay } from "./calendar-day";
import type { CalendarDayCell, HolidayOptions } from "./types";

const WEEK_DAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

type CalendarGridProps = {
  cells: CalendarDayCell[];
  value: string;
  today: string;
  recorded: Set<string>;
  holidayOptions: HolidayOptions;
  onSelect: (date: string) => void;
};

export function CalendarGrid({
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
        {cells.map((cell) => (
          <CalendarDay
            key={cell.key}
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
