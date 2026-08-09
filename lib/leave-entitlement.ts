import { jalaliParts, shiftDateKey } from "./format.ts";
import { getHolidayInfo } from "./holidays.ts";
import { getDailyTargetMinutes } from "./work-schedule.ts";
import type { AppData, LeaveEntry, Settings } from "./types.ts";

export const LEGAL_WEEKLY_WORK_MINUTES = 44 * 60;
export const LEGAL_WORK_DAYS_PER_WEEK = 6;
export const LEGAL_LEAVE_DAYS_PER_YEAR = 26;
export const LEGAL_LEAVE_DAY_MINUTES = LEGAL_WEEKLY_WORK_MINUTES / LEGAL_WORK_DAYS_PER_WEEK;
export const LEGAL_ANNUAL_LEAVE_MINUTES = LEGAL_LEAVE_DAY_MINUTES * LEGAL_LEAVE_DAYS_PER_YEAR;
export const LEGAL_MONTHLY_LEAVE_MINUTES = LEGAL_ANNUAL_LEAVE_MINUTES / 12;

export const LEGACY_DEFAULT_LEAVE_BALANCE_MINUTES = 26 * 60;
export const LEGACY_DEFAULT_MONTHLY_LEAVE_MINUTES = 16 * 60;

const MAX_LEAVE_RANGE_DAYS = 370;

export type LeaveEntitlementSummary = {
  monthlyEntitlement: number;
  annualEntitlement: number;
  carryover: number;
  used: number;
  available: number;
};

export function normalizeLeaveSettings(settings: Pick<Settings, "leaveBalanceMinutes" | "monthlyLeaveMinutes">) {
  const legacyDefaults =
    settings.leaveBalanceMinutes === LEGACY_DEFAULT_LEAVE_BALANCE_MINUTES &&
    settings.monthlyLeaveMinutes === LEGACY_DEFAULT_MONTHLY_LEAVE_MINUTES;

  if (legacyDefaults) {
    return {
      leaveBalanceMinutes: 0,
      monthlyLeaveMinutes: LEGAL_MONTHLY_LEAVE_MINUTES,
    };
  }

  return {
    leaveBalanceMinutes: Math.max(0, Number.isFinite(settings.leaveBalanceMinutes) ? settings.leaveBalanceMinutes : 0),
    monthlyLeaveMinutes: Math.max(
      0,
      Number.isFinite(settings.monthlyLeaveMinutes) ? settings.monthlyLeaveMinutes : LEGAL_MONTHLY_LEAVE_MINUTES,
    ),
  };
}

function isSameJalaliYear(dateKey: string, referenceDate: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  const reference = new Date(`${referenceDate}T12:00:00`);
  if (Number.isNaN(date.getTime()) || Number.isNaN(reference.getTime())) return false;
  return jalaliParts(date).year === jalaliParts(reference).year;
}

function getLeaveDayMinutes(date: string, type: Exclude<LeaveEntry["type"], "hourly">, data: AppData) {
  const target = getDailyTargetMinutes(date, data.settings);
  if (target <= 0) return 0;

  const holiday = getHolidayInfo(date, {
    mode: data.settings.mode,
    manualHoliday: Boolean(data.records[date]?.holiday),
    includeOfficialHolidays: data.settings.autoOfficialHolidays,
    includeWeeklyHoliday: data.settings.autoWeeklyHoliday,
    overrides: data.holidayOverrides,
  });
  if (holiday.isHoliday) return 0;

  return type === "half" ? target / 2 : target;
}

export function getLeaveEntryUsedMinutes(entry: LeaveEntry, data: AppData, referenceDate?: string) {
  if (entry.type === "hourly") {
    if (referenceDate && !isSameJalaliYear(entry.startDate, referenceDate)) return 0;
    const target = getDailyTargetMinutes(entry.startDate, data.settings);
    if (target <= 0) return 0;
    const holiday = getHolidayInfo(entry.startDate, {
      mode: data.settings.mode,
      manualHoliday: Boolean(data.records[entry.startDate]?.holiday),
      includeOfficialHolidays: data.settings.autoOfficialHolidays,
      includeWeeklyHoliday: data.settings.autoWeeklyHoliday,
      overrides: data.holidayOverrides,
    });
    return holiday.isHoliday ? 0 : Math.max(0, entry.minutes);
  }

  if (!entry.startDate || !entry.endDate || entry.endDate < entry.startDate) return 0;

  let total = 0;
  let cursor = entry.startDate;
  for (let index = 0; index < MAX_LEAVE_RANGE_DAYS && cursor <= entry.endDate; index += 1) {
    if (!referenceDate || isSameJalaliYear(cursor, referenceDate)) {
      total += getLeaveDayMinutes(cursor, entry.type, data);
    }
    cursor = shiftDateKey(cursor, 1);
  }
  return total;
}

export function calculateLeaveEntitlementSummary(data: AppData, referenceDate: string): LeaveEntitlementSummary {
  const normalized = normalizeLeaveSettings(data.settings);
  const monthlyEntitlement = normalized.monthlyLeaveMinutes;
  const annualEntitlement = monthlyEntitlement * 12;
  const carryover = normalized.leaveBalanceMinutes;
  const used = data.leaves.reduce(
    (sum, entry) => sum + getLeaveEntryUsedMinutes(entry, data, referenceDate),
    0,
  );

  return {
    monthlyEntitlement,
    annualEntitlement,
    carryover,
    used,
    available: annualEntitlement + carryover - used,
  };
}
