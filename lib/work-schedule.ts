import type { Settings, WeekdayKey, WorkScheduleDay, WorkTimingMode } from "./types.ts";
import { timeToMinutes } from "./time-engine.ts";

type ScheduleTargetInput = Omit<WorkScheduleDay, "targetMinutes"> & { targetMinutes?: number };

export type WeeklyScheduleSettings = {
  weeklyMinutes: number;
  weeklySchedule: Record<WeekdayKey, WorkScheduleDay>;
  workTimingMode?: WorkTimingMode;
};

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

function configuredMinutes(start: string, end: string, lunchMinutes: number, lunchPaid: boolean) {
  const startMinutes = timeToMinutes(start);
  let endMinutes = timeToMinutes(end);
  if (endMinutes <= startMinutes) endMinutes += 24 * 60;
  const unpaidLunch = lunchPaid ? 0 : Math.max(0, lunchMinutes);
  return Math.max(0, endMinutes - startMinutes - unpaidLunch);
}

export function createDefaultWeeklySchedule(
  defaultStart = "07:30",
  defaultEnd = "16:15",
  lunchMinutes = 45,
): Record<WeekdayKey, WorkScheduleDay> {
  const targetMinutes = configuredMinutes(defaultStart, defaultEnd, lunchMinutes, false);
  return Object.fromEntries(
    weekdayOrder.map((day, index) => [
      day,
      {
        enabled: index < 5,
        start: defaultStart,
        end: defaultEnd,
        lunchMinutes,
        lunchPaid: false,
        targetMinutes,
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

export function getConfiguredWorkMinutes(schedule: ScheduleTargetInput): number {
  return configuredMinutes(schedule.start, schedule.end, schedule.lunchMinutes, Boolean(schedule.lunchPaid));
}

export function getScheduleTargetMinutes(schedule: ScheduleTargetInput, mode: WorkTimingMode = "scheduled"): number {
  if (!schedule.enabled) return 0;
  if (mode === "flexible") {
    const storedTarget = typeof schedule.targetMinutes === "number" && Number.isFinite(schedule.targetMinutes) ? schedule.targetMinutes : getConfiguredWorkMinutes(schedule);
    return Math.max(0, Math.round(storedTarget));
  }
  return getConfiguredWorkMinutes(schedule);
}

function endForTarget(schedule: ScheduleTargetInput, target: number, lunchMinutes = schedule.lunchMinutes, lunchPaid = Boolean(schedule.lunchPaid)) {
  const start = timeToMinutes(schedule.start);
  const unpaidLunch = lunchPaid ? 0 : Math.max(0, lunchMinutes);
  const endMinutes = (start + Math.max(0, target) + unpaidLunch) % (24 * 60);
  return `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
}

export function updateScheduleLunch(
  schedule: ScheduleTargetInput,
  patch: { lunchMinutes?: number; lunchPaid?: boolean },
  mode: WorkTimingMode = "scheduled",
): WorkScheduleDay {
  const target = getScheduleTargetMinutes({ ...schedule, enabled: true }, mode);
  const lunchMinutes = patch.lunchMinutes ?? schedule.lunchMinutes;
  const lunchPaid = patch.lunchPaid ?? Boolean(schedule.lunchPaid);
  if (mode === "flexible") {
    return {
      ...schedule,
      lunchMinutes: Math.max(0, lunchMinutes),
      lunchPaid,
      targetMinutes: target,
    };
  }
  return {
    ...schedule,
    lunchMinutes: Math.max(0, lunchMinutes),
    lunchPaid,
    targetMinutes: target,
    end: endForTarget(schedule, target, lunchMinutes, lunchPaid),
  };
}

export function applyLunchMinutesToAll<T extends WeeklyScheduleSettings & { lunchMinutes: number }>(settings: T, lunchMinutes: number): T {
  const nextLunchMinutes = Math.max(0, Math.round(lunchMinutes));
  const mode = settings.workTimingMode ?? "scheduled";
  const weeklySchedule = Object.fromEntries(
    weekdayOrder.map((day) => [day, updateScheduleLunch(settings.weeklySchedule[day], { lunchMinutes: nextLunchMinutes }, mode)]),
  ) as Record<WeekdayKey, WorkScheduleDay>;
  return {
    ...settings,
    lunchMinutes: nextLunchMinutes,
    weeklyMinutes: getWeeklyTargetMinutes({ ...settings, weeklySchedule }),
    weeklySchedule,
  };
}

export function applyLunchPaidToAll<T extends WeeklyScheduleSettings>(settings: T, lunchPaid: boolean): T {
  const mode = settings.workTimingMode ?? "scheduled";
  const weeklySchedule = Object.fromEntries(
    weekdayOrder.map((day) => [day, updateScheduleLunch(settings.weeklySchedule[day], { lunchPaid }, mode)]),
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
  const mode = settings.workTimingMode ?? "scheduled";

  const weeklySchedule = Object.fromEntries(
    weekdayOrder.map((day) => {
      const current = settings.weeklySchedule[day];
      if (!current.enabled) return [day, current];
      if (mode === "flexible") {
        return [day, {
          ...current,
          targetMinutes: source.targetMinutes,
          lunchMinutes: source.lunchMinutes,
          lunchPaid: source.lunchPaid,
        }];
      }
      return [day, {
        ...current,
        start: source.start,
        end: source.end,
        lunchMinutes: source.lunchMinutes,
        lunchPaid: source.lunchPaid,
        targetMinutes: getConfiguredWorkMinutes(source),
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
  return getScheduleTargetMinutes(getWorkScheduleDay(date, settings), settings.workTimingMode);
}

export function getWeeklyTargetMinutes(settings: WeeklyScheduleSettings): number {
  const mode = settings.workTimingMode ?? "scheduled";
  return weekdayOrder.reduce(
    (sum, day) => sum + getScheduleTargetMinutes(settings.weeklySchedule[day], mode),
    0,
  );
}

export function applyWeeklyTargetHours<T extends WeeklyScheduleSettings>(settings: T, hours: number): T {
  const enabledDays = weekdayOrder.filter((day) => settings.weeklySchedule[day].enabled);
  if (!enabledDays.length) return settings;

  const mode = settings.workTimingMode ?? "scheduled";
  const totalMinutes = Math.max(0, Math.round(hours * 60));
  const baseTarget = Math.floor(totalMinutes / enabledDays.length);
  const remainder = totalMinutes % enabledDays.length;
  const weeklySchedule = { ...settings.weeklySchedule };

  enabledDays.forEach((day, index) => {
    const schedule = weeklySchedule[day];
    const targetMinutes = baseTarget + (index < remainder ? 1 : 0);
    if (mode === "flexible") {
      weeklySchedule[day] = { ...schedule, targetMinutes };
      return;
    }
    weeklySchedule[day] = {
      ...schedule,
      targetMinutes,
      end: endForTarget(schedule, targetMinutes),
    };
  });

  return { ...settings, weeklyMinutes: totalMinutes, weeklySchedule };
}
