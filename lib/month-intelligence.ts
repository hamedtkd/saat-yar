import { calendarMonthCells, localDateKey, shiftDateKey } from "./format.ts";
import type { CalendarSystem } from "./i18n/calendars.ts";
import { calc } from "./time-engine.ts";
import type { Settings, WorkRecord } from "./types.ts";
import { getDailyTargetMinutes } from "./work-schedule.ts";

export type MonthActivityCell = {
  key: string;
  inMonth: boolean;
  worked: number;
  target: number;
  balance: number;
  intensity: 0 | 1 | 2 | 3 | 4;
  hasRecord: boolean;
};


export type RecentActivityDay = {
  key: string;
  worked: number;
  target: number;
  balance: number;
  hasRecord: boolean;
};

export type MonthIntelligenceSummary = {
  activeDays: number;
  longestStreak: number;
  overtimeDays: number;
  deficitDays: number;
  balancedDays: number;
  overtimeMinutes: number;
  deficitMinutes: number;
  bestDay: MonthActivityCell | null;
};

export function getActivityIntensity(worked: number, target: number): 0 | 1 | 2 | 3 | 4 {
  if (worked <= 0) return 0;
  if (target <= 0) return 4;
  const ratio = worked / target;
  if (ratio < 0.25) return 1;
  if (ratio < 0.5) return 2;
  if (ratio <= 1) return 3;
  return 4;
}

export function buildMonthActivityCells(
  selectedDate: string,
  calendar: CalendarSystem,
  records: WorkRecord[],
  settings: Settings,
): MonthActivityCell[] {
  const recordMap = new Map(records.map((record) => [record.date, record]));
  return calendarMonthCells(selectedDate, calendar).map((cell) => {
    const record = cell.inMonth ? recordMap.get(cell.key) : undefined;
    if (!record) {
      return { key: cell.key, inMonth: cell.inMonth, worked: 0, target: 0, balance: 0, intensity: 0, hasRecord: false };
    }
    const result = calc(record, getDailyTargetMinutes(record.date, settings));
    return {
      key: cell.key,
      inMonth: cell.inMonth,
      worked: result.worked,
      target: result.target,
      balance: result.balance,
      intensity: getActivityIntensity(result.worked, result.target),
      hasRecord: true,
    };
  });
}

export function buildRecentActivityDays(
  selectedDate: string,
  calendar: CalendarSystem,
  records: WorkRecord[],
  settings: Settings,
  count = 7,
  today = localDateKey(),
): RecentActivityDay[] {
  const monthKeys = calendarMonthCells(selectedDate, calendar).filter((cell) => cell.inMonth).map((cell) => cell.key);
  const firstDay = monthKeys[0] ?? selectedDate;
  const lastDay = monthKeys[monthKeys.length - 1] ?? selectedDate;
  const anchorDate = today >= firstDay && today <= lastDay ? today : lastDay;
  const recordMap = new Map(records.map((record) => [record.date, record]));
  return Array.from({ length: count }, (_, index) => {
    const key = shiftDateKey(anchorDate, -index);
    const target = getDailyTargetMinutes(key, settings);
    const record = recordMap.get(key);
    if (!record) return { key, worked: 0, target, balance: 0, hasRecord: false };
    const result = calc(record, target);
    return { key, worked: result.worked, target: result.target, balance: result.balance, hasRecord: true };
  });
}

export function summarizeMonthIntelligence(cells: MonthActivityCell[], balanceToleranceMinutes = 5): MonthIntelligenceSummary {
  const monthCells = cells.filter((cell) => cell.inMonth);
  let activeDays = 0;
  let streak = 0;
  let longestStreak = 0;
  let overtimeDays = 0;
  let deficitDays = 0;
  let balancedDays = 0;
  let overtimeMinutes = 0;
  let deficitMinutes = 0;
  let bestDay: MonthActivityCell | null = null;

  for (const cell of monthCells) {
    if (cell.worked > 0) {
      activeDays += 1;
      streak += 1;
      longestStreak = Math.max(longestStreak, streak);
      if (!bestDay || cell.worked > bestDay.worked) bestDay = cell;
    } else {
      streak = 0;
    }

    if (!cell.hasRecord) continue;
    if (cell.balance > balanceToleranceMinutes) {
      overtimeDays += 1;
      overtimeMinutes += cell.balance;
    } else if (cell.balance < -balanceToleranceMinutes) {
      deficitDays += 1;
      deficitMinutes += Math.abs(cell.balance);
    } else {
      balancedDays += 1;
    }
  }

  return {
    activeDays,
    longestStreak,
    overtimeDays,
    deficitDays,
    balancedDays,
    overtimeMinutes,
    deficitMinutes,
    bestDay,
  };
}
