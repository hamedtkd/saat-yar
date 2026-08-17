import type { Settings, WeekdayKey, WorkScheduleDay } from "./types.ts";
import { getWeeklyTargetMinutes, weekdayOrder } from "./work-schedule.ts";

export type WorkSettingsInput = Pick<
  Settings,
  "mode" | "workTimingMode" | "autoOfficialHolidays" | "autoWeeklyHoliday" | "weeklyMinutes" | "weeklySchedule" | "lunchMinutes"
>;

function firstEnabledDay(schedule: Record<WeekdayKey, WorkScheduleDay>) {
  return weekdayOrder.find((day) => schedule[day].enabled) ?? null;
}

export function mergeWorkSettings(settings: Settings, next: WorkSettingsInput): Settings {
  const enabledDays = weekdayOrder.filter((day) => next.weeklySchedule[day].enabled);
  if (!enabledDays.length) return settings;

  const firstDay = firstEnabledDay(next.weeklySchedule) ?? enabledDays[0];
  const firstSchedule = next.weeklySchedule[firstDay];

  return {
    ...settings,
    ...next,
    workDays: enabledDays.length,
    weeklyMinutes: getWeeklyTargetMinutes(next),
    defaultStart: firstSchedule.start,
    defaultEnd: firstSchedule.end,
    lunchMinutes: next.lunchMinutes,
  };
}
