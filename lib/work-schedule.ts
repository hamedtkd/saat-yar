import type { Settings, WeekdayKey, WorkScheduleDay } from "./types.ts";

export type WeeklyScheduleSettings = {
  weeklyMinutes: number;
  weeklySchedule: Record<WeekdayKey, WorkScheduleDay>;
};
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
        lunchPaid: false,
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

export function isScheduledDayOff(
  date: string,
  settings: Pick<Settings, "weeklySchedule">,
): boolean {
  return !settings.weeklySchedule[getWeekdayKey(date)].enabled;
}

export function getConfiguredWorkMinutes(schedule: WorkScheduleDay): number {
  const start = timeToMinutes(schedule.start);
  let end = timeToMinutes(schedule.end);
  if (end <= start) end += 24 * 60;
  const unpaidLunch = schedule.lunchPaid ? 0 : Math.max(0, schedule.lunchMinutes);
  return Math.max(0, end - start - unpaidLunch);
}

export function getScheduleTargetMinutes(schedule: WorkScheduleDay): number {
  return schedule.enabled ? getConfiguredWorkMinutes(schedule) : 0;
}

function endForTarget(schedule: WorkScheduleDay, target: number, lunchMinutes = schedule.lunchMinutes, lunchPaid = Boolean(schedule.lunchPaid)) {
  const start = timeToMinutes(schedule.start);
  const unpaidLunch = lunchPaid ? 0 : Math.max(0, lunchMinutes);
  const endMinutes = (start + Math.max(0, target) + unpaidLunch) % (24 * 60);
  return `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
}

export function updateScheduleLunch(schedule: WorkScheduleDay, patch: { lunchMinutes?: number; lunchPaid?: boolean }): WorkScheduleDay {
  const target = getConfiguredWorkMinutes(schedule);
  const lunchMinutes = patch.lunchMinutes ?? schedule.lunchMinutes;
  const lunchPaid = patch.lunchPaid ?? Boolean(schedule.lunchPaid);
  return {
    ...schedule,
    lunchMinutes: Math.max(0, lunchMinutes),
    lunchPaid,
    end: endForTarget(schedule, target, lunchMinutes, lunchPaid),
  };
}

export function applyLunchMinutesToAll<T extends WeeklyScheduleSettings & { lunchMinutes: number }>(settings: T, lunchMinutes: number): T {
  const nextLunchMinutes = Math.max(0, Math.round(lunchMinutes));
  const weeklySchedule = Object.fromEntries(
    weekdayOrder.map((day) => [day, updateScheduleLunch(settings.weeklySchedule[day], { lunchMinutes: nextLunchMinutes })]),
  ) as Record<WeekdayKey, WorkScheduleDay>;
  return {
    ...settings,
    lunchMinutes: nextLunchMinutes,
    weeklyMinutes: getWeeklyTargetMinutes({ ...settings, weeklySchedule }),
    weeklySchedule,
  };
}

export function applyLunchPaidToAll<T extends WeeklyScheduleSettings>(settings: T, lunchPaid: boolean): T {
  const weeklySchedule = Object.fromEntries(
    weekdayOrder.map((day) => [day, updateScheduleLunch(settings.weeklySchedule[day], { lunchPaid })]),
  ) as Record<WeekdayKey, WorkScheduleDay>;
  return {
    ...settings,
    weeklyMinutes: getWeeklyTargetMinutes({ ...settings, weeklySchedule }),
    weeklySchedule,
  };
}

export function applyScheduleDayToEnabledDays<T extends WeeklyScheduleSettings>(settings: T, sourceDay: WeekdayKey): T {
  const source = settings.weeklySchedule[sourceDay];
  if (!source.enabled) return settings;

  const weeklySchedule = Object.fromEntries(
    weekdayOrder.map((day) => {
      const current = settings.weeklySchedule[day];
      if (!current.enabled) return [day, current];
      return [day, {
        ...current,
        start: source.start,
        end: source.end,
        lunchMinutes: source.lunchMinutes,
        lunchPaid: source.lunchPaid,
      }];
    }),
  ) as Record<WeekdayKey, WorkScheduleDay>;

  return {
    ...settings,
    weeklyMinutes: getWeeklyTargetMinutes({ ...settings, weeklySchedule }),
    weeklySchedule,
  };
}

export function getDailyTargetMinutes(date: string, settings: Settings): number {
  return getScheduleTargetMinutes(getWorkScheduleDay(date, settings));
}

export function getWeeklyTargetMinutes(settings: WeeklyScheduleSettings): number {
  return weekdayOrder.reduce(
    (sum, day) => sum + getScheduleTargetMinutes(settings.weeklySchedule[day]),
    0,
  );
}

export function applyWeeklyTargetHours<T extends WeeklyScheduleSettings>(settings: T, hours: number): T {
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
    const endMinutes = (start + (schedule.lunchPaid ? 0 : Math.max(0, schedule.lunchMinutes)) + target) % (24 * 60);
    const end = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
    weeklySchedule[day] = { ...schedule, end };
  });

  return { ...settings, weeklyMinutes: totalMinutes, weeklySchedule };
}
