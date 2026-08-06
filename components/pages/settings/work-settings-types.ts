import type { Settings } from "@/lib/types";

export type WorkSettingsDraft = Pick<
  Settings,
  | "mode"
  | "salary"
  | "overtimeMultiplier"
  | "holidayMultiplier"
  | "autoOfficialHolidays"
  | "autoWeeklyHoliday"
  | "weeklyMinutes"
  | "weeklySchedule"
>;

export function createWorkSettingsDraft(settings: Settings): WorkSettingsDraft {
  return {
    mode: settings.mode,
    salary: settings.salary,
    overtimeMultiplier: settings.overtimeMultiplier,
    holidayMultiplier: settings.holidayMultiplier,
    autoOfficialHolidays: settings.autoOfficialHolidays,
    autoWeeklyHoliday: settings.autoWeeklyHoliday,
    weeklyMinutes: settings.weeklyMinutes,
    weeklySchedule: settings.weeklySchedule,
  };
}
