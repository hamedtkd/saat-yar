import type { Settings, WeekdayKey, WorkScheduleDay } from "./types.ts";
import { timeToMinutes } from "./time-engine.ts";

export const weekdayOrder: WeekdayKey[] = [
  "saturday",
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

export const weekdayLabels: Record<WeekdayKey, string> = {
  saturday: "شنبه",
  sunday: "یکشنبه",
  monday: "دوشنبه",
  tuesday: "سه‌شنبه",
  wednesday: "چهارشنبه",
  thursday: "پنجشنبه",
  friday: "جمعه",
};

const jsDayToWeekday: WeekdayKey[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function createDefaultWeeklySchedule(
  defaultStart = "07:30",
  defaultEnd = "16:15",
  lunchMinutes = 45,
): Record<WeekdayKey, WorkScheduleDay> {
  return Object.fromEntries(
    weekdayOrder.map((day, index) => [
      day,
      {
        enabled: index < 5,
        start: defaultStart,
        end: defaultEnd,
        lunchMinutes,
      },
    ]),
  ) as Record<WeekdayKey, WorkScheduleDay>;
}

export function getWeekdayKey(date: string | Date): WeekdayKey {
  const value = typeof date === "string" ? new Date(`${date}T12:00:00`) : date;
  return jsDayToWeekday[value.getDay()];
}

export function getWorkScheduleDay(date: string, settings: Settings): WorkScheduleDay {
  return settings.weeklySchedule[getWeekdayKey(date)];
}

export function getScheduleTargetMinutes(schedule: WorkScheduleDay): number {
  if (!schedule.enabled) return 0;
  const start = timeToMinutes(schedule.start);
  let end = timeToMinutes(schedule.end);
  if (end <= start) end += 24 * 60;
  return Math.max(0, end - start - Math.max(0, schedule.lunchMinutes));
}

export function getDailyTargetMinutes(date: string, settings: Settings): number {
  return getScheduleTargetMinutes(getWorkScheduleDay(date, settings));
}

export function getWeeklyTargetMinutes(settings: Settings): number {
  return weekdayOrder.reduce(
    (sum, day) => sum + getScheduleTargetMinutes(settings.weeklySchedule[day]),
    0,
  );
}

export function applyWeeklyTargetHours(settings: Settings, hours: number): Settings {
  const enabledDays = weekdayOrder.filter((day) => settings.weeklySchedule[day].enabled);
  if (!enabledDays.length) return settings;

  const totalMinutes = Math.max(0, Math.round(hours * 60));
  const baseTarget = Math.floor(totalMinutes / enabledDays.length);
  const remainder = totalMinutes % enabledDays.length;
  const weeklySchedule = { ...settings.weeklySchedule };

  enabledDays.forEach((day, index) => {
    const schedule = weeklySchedule[day];
    const start = timeToMinutes(schedule.start);
    const target = baseTarget + (index < remainder ? 1 : 0);
    const endMinutes = (start + Math.max(0, schedule.lunchMinutes) + target) % (24 * 60);
    const end = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
    weeklySchedule[day] = { ...schedule, end };
  });

  return { ...settings, weeklyMinutes: totalMinutes, weeklySchedule };
}
