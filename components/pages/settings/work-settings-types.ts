import type { Settings } from "@/lib/types";

export type WorkSettingsDraft = Pick<
  Settings,
  | "mode"
  | "workTimingMode"
  | "autoOfficialHolidays"
  | "autoWeeklyHoliday"
  | "weeklyMinutes"
  | "weeklySchedule"
  | "lunchMinutes"
>;

export function createWorkSettingsDraft(settings: Settings): WorkSettingsDraft {
  return {
    mode: settings.mode,
    workTimingMode: settings.workTimingMode,
    autoOfficialHolidays: settings.autoOfficialHolidays,
    autoWeeklyHoliday: settings.autoWeeklyHoliday,
    weeklyMinutes: settings.weeklyMinutes,
    weeklySchedule: settings.weeklySchedule,
    lunchMinutes: settings.lunchMinutes,
  };
}
