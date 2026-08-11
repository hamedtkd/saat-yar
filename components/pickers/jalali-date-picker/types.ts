import { calendarMonthCells } from "@/lib/format";
import type { HolidayOverride, Mode, Settings } from "@/lib/types";

export type JalaliDatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  recordedDates?: string[];
  mode?: Mode;
  includeOfficialHolidays?: boolean;
  includeWeeklyHoliday?: boolean;
  holidayOverrides?: HolidayOverride[];
  weeklySchedule?: Settings["weeklySchedule"];
  placeholder?: string;
};

export type CalendarDayCell = ReturnType<typeof calendarMonthCells>[number];

export type HolidayOptions = {
  mode: Mode;
  includeOfficialHolidays: boolean;
  includeWeeklyHoliday: boolean;
  holidayOverrides: HolidayOverride[];
  weeklySchedule?: Settings["weeklySchedule"];
};
