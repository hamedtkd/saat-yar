import { jalaliMonthCells } from "@/lib/format";
import type { HolidayOverride, Mode } from "@/lib/types";

export type JalaliDatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  recordedDates?: string[];
  mode?: Mode;
  includeOfficialHolidays?: boolean;
  includeWeeklyHoliday?: boolean;
  holidayOverrides?: HolidayOverride[];
  placeholder?: string;
};

export type CalendarDayCell = ReturnType<typeof jalaliMonthCells>[number];

export type HolidayOptions = {
  mode: Mode;
  includeOfficialHolidays: boolean;
  includeWeeklyHoliday: boolean;
  holidayOverrides: HolidayOverride[];
};
