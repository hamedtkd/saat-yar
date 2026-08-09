import type { Settings } from "@/lib/types";

export type WorkSettingsDraft = Pick<
  Settings,
  | "mode"
  | "autoOfficialHolidays"
  | "autoWeeklyHoliday"
  | "weeklyMinutes"
  | "weeklySchedule"
  | "lunchMinutes"
>;

export function createWorkSettingsDraft(settings: Settings): WorkSettingsDraft {
  return {
    mode: settings.mode,
    autoOfficialHolidays: settings.autoOfficialHolidays,
    autoWeeklyHoliday: settings.autoWeeklyHoliday,
    weeklyMinutes: settings.weeklyMinutes,
    weeklySchedule: settings.weeklySchedule,
    lunchMinutes: settings.lunchMinutes,
  };
}
