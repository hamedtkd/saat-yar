import { calendarMonthCells, localDateKey, shiftDateKey } from "./format.ts";
import type { CalendarSystem } from "./i18n/calendars.ts";
import { getEffectiveWorkRecordForDate } from "./leave-entitlement.ts";
import { calc } from "./time-engine.ts";
import type { AppData, Settings, WorkRecord } from "./types.ts";
import { getDailyTargetMinutes } from "./work-schedule.ts";


type MonthIntelligenceData = Pick<AppData, "settings" | "records" | "leaves" | "holidayOverrides">;

function resolveMonthIntelligenceData(dataOrRecords: MonthIntelligenceData | WorkRecord[], settings?: Settings): MonthIntelligenceData {
  if (!Array.isArray(dataOrRecords)) return dataOrRecords;
  if (!settings) throw new Error("Settings are required when building month intelligence from raw records.");
  return {
    settings,
    records: Object.fromEntries(dataOrRecords.map((record) => [record.date, record])),
    leaves: [],
    holidayOverrides: [],
  };
}
export type MonthActivityCell = {
  key: string;
  inMonth: boolean;
  worked: number;
  leave: number;
  credited: number;
  target: number;
  balance: number;
  intensity: 0 | 1 | 2 | 3 | 4;
  hasRecord: boolean;
};


export type RecentActivityDay = {
  key: string;
  worked: number;
  leave: number;
  credited: number;
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
  workedMinutes: number;
  leaveMinutes: number;
  leaveDays: number;
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
  dataOrRecords: MonthIntelligenceData | WorkRecord[],
  settings?: Settings,
): MonthActivityCell[] {
  const data = resolveMonthIntelligenceData(dataOrRecords, settings);
  return calendarMonthCells(selectedDate, calendar).map((cell) => {
    if (!cell.inMonth) {
      return { key: cell.key, inMonth: false, worked: 0, leave: 0, credited: 0, target: 0, balance: 0, intensity: 0, hasRecord: false };
    }
    const record = getEffectiveWorkRecordForDate(cell.key, data);
    const result = calc(record, getDailyTargetMinutes(cell.key, data.settings));
    const hasRecord = Boolean(data.records[cell.key]) || result.leave > 0;
    return {
      key: cell.key,
      inMonth: true,
      worked: result.worked,
      leave: result.leave,
      credited: result.credited,
      target: result.target,
      balance: result.balance,
      intensity: getActivityIntensity(result.worked, result.target),
      hasRecord,
    };
  });
}

export function buildRecentActivityDays(
  selectedDate: string,
  calendar: CalendarSystem,
  dataOrRecords: MonthIntelligenceData | WorkRecord[],
  settingsOrCount?: Settings | number,
  countOrToday?: number | string,
  legacyToday?: string,
): RecentActivityDay[] {
  const legacy = Array.isArray(dataOrRecords);
  const data = resolveMonthIntelligenceData(dataOrRecords, legacy ? settingsOrCount as Settings : undefined);
  const count = legacy
    ? typeof countOrToday === "number" ? countOrToday : 7
    : typeof settingsOrCount === "number" ? settingsOrCount : 7;
  const today = legacy
    ? legacyToday ?? localDateKey()
    : typeof countOrToday === "string" ? countOrToday : localDateKey();
  const monthKeys = calendarMonthCells(selectedDate, calendar).filter((cell) => cell.inMonth).map((cell) => cell.key);
  const firstDay = monthKeys[0] ?? selectedDate;
  const lastDay = monthKeys[monthKeys.length - 1] ?? selectedDate;
  const anchorDate = today >= firstDay && today <= lastDay ? today : lastDay;
  return Array.from({ length: count }, (_, index) => {
    const key = shiftDateKey(anchorDate, -index);
    const record = getEffectiveWorkRecordForDate(key, data);
    const result = calc(record, getDailyTargetMinutes(key, data.settings));
    return {
      key,
      worked: result.worked,
      leave: result.leave,
      credited: result.credited,
      target: result.target,
      balance: result.balance,
      hasRecord: Boolean(data.records[key]) || result.leave > 0,
    };
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
  let workedMinutes = 0;
  let leaveMinutes = 0;
  let leaveDays = 0;
  let bestDay: MonthActivityCell | null = null;

  for (const cell of monthCells) {
    workedMinutes += cell.worked;
    leaveMinutes += cell.leave;
    if (cell.leave > 0) leaveDays += 1;
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
    workedMinutes,
    leaveMinutes,
    leaveDays,
    bestDay,
  };
}
