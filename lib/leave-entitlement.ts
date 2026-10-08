import { emptyRecord, jalaliParts, shiftDateKey } from "./format.ts";
import { getHolidayInfo } from "./holidays.ts";
import { getDailyTargetMinutes } from "./work-schedule.ts";
import { calculateLeaveLedgerSummary } from "./leave-ledger.ts";
import type { AppData, LeaveEntry, Settings } from "./types.ts";

export const LEGAL_WEEKLY_WORK_MINUTES = 44 * 60;
export const LEGAL_WORK_DAYS_PER_WEEK = 6;
export const LEGAL_LEAVE_DAYS_PER_YEAR = 26;
export const LEGAL_LEAVE_DAY_MINUTES = LEGAL_WEEKLY_WORK_MINUTES / LEGAL_WORK_DAYS_PER_WEEK;
export const LEGAL_ANNUAL_LEAVE_MINUTES = LEGAL_LEAVE_DAY_MINUTES * LEGAL_LEAVE_DAYS_PER_YEAR;
export const LEGAL_MONTHLY_LEAVE_MINUTES = LEGAL_ANNUAL_LEAVE_MINUTES / 12;
export const DEFAULT_MONTHLY_LEAVE_MINUTES = 16 * 60;

export const LEGACY_DEFAULT_LEAVE_BALANCE_MINUTES = 26 * 60;
export const LEGACY_DEFAULT_MONTHLY_LEAVE_MINUTES = 16 * 60;

const MAX_LEAVE_RANGE_DAYS = 370;

export type LeaveEntitlementSummary = {
  monthlyEntitlement: number;
  annualEntitlement: number;
  carryover: number;
  used: number;
  available: number;
  year: number;
  currentMonth: number;
  accruedThisYear: number;
  adjustments: number;
  cashOut: number;
  monthlyBreakdown: ReturnType<typeof calculateLeaveLedgerSummary>["monthlyBreakdown"];
};

export function normalizeLeaveSettings(settings: Pick<Settings, "leaveBalanceMinutes" | "monthlyLeaveMinutes">) {
  return {
    leaveBalanceMinutes: Math.max(0, Number.isFinite(settings.leaveBalanceMinutes) ? settings.leaveBalanceMinutes : 0),
    monthlyLeaveMinutes: Math.max(
      0,
      Math.round(Number.isFinite(settings.monthlyLeaveMinutes) ? settings.monthlyLeaveMinutes : DEFAULT_MONTHLY_LEAVE_MINUTES),
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

export function getLeaveEntryUsedMinutes(entry: LeaveEntry, data: AppData, referenceDate?: string, referenceMonth?: number) {
  if (entry.type === "hourly") {
    if (referenceDate && !isSameJalaliYear(entry.startDate, referenceDate)) return 0;
    if (referenceDate && referenceMonth && jalaliParts(new Date(`${entry.startDate}T12:00:00`)).month !== referenceMonth) return 0;
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
    if ((!referenceDate || isSameJalaliYear(cursor, referenceDate)) && (!referenceDate || !referenceMonth || jalaliParts(new Date(`${cursor}T12:00:00`)).month === referenceMonth)) {
      total += getLeaveDayMinutes(cursor, entry.type, data);
    }
    cursor = shiftDateKey(cursor, 1);
  }
  return total;
}

export function calculateLeaveEntitlementSummary(data: AppData, referenceDate: string): LeaveEntitlementSummary {
  const ledger = calculateLeaveLedgerSummary(data, referenceDate);
  return {
    monthlyEntitlement: ledger.monthlyEntitlement,
    annualEntitlement: ledger.annualPolicyMaximum,
    carryover: ledger.carryover,
    used: ledger.used,
    available: ledger.available,
    year: ledger.year,
    currentMonth: ledger.currentMonth,
    accruedThisYear: ledger.accruedThisYear,
    adjustments: ledger.adjustments,
    cashOut: ledger.cashOut,
    monthlyBreakdown: ledger.monthlyBreakdown,
  };
}

export function getRegisteredLeaveMinutesForDate(date: string, data: Pick<AppData, "settings" | "records" | "leaves" | "holidayOverrides">) {
  const target = getDailyTargetMinutes(date, data.settings);
  if (target <= 0) return 0;
  const record = data.records[date];
  const holiday = getHolidayInfo(date, {
    mode: data.settings.mode,
    manualHoliday: Boolean(record?.holiday),
    includeOfficialHolidays: data.settings.autoOfficialHolidays,
    includeWeeklyHoliday: data.settings.autoWeeklyHoliday,
    overrides: data.holidayOverrides,
  });
  if (holiday.isHoliday) return 0;

  const registered = data.leaves.reduce((sum, entry) => {
    if (date < entry.startDate || date > entry.endDate) return sum;
    if (entry.type === "hourly") return sum + (date === entry.startDate ? Math.max(0, entry.minutes) : 0);
    return sum + (entry.type === "half" ? target / 2 : target);
  }, 0);
  return Math.min(target, registered);
}

export function getEffectiveWorkRecordForDate(date: string, data: Pick<AppData, "settings" | "records" | "leaves" | "holidayOverrides">) {
  const base = data.records[date] ?? emptyRecord(date, data.settings);
  const target = getDailyTargetMinutes(date, data.settings);
  const registeredLeave = getRegisteredLeaveMinutesForDate(date, data);
  const recordLeave = base.leaveType === "full" ? target : base.leaveType === "hourly" ? Math.max(0, base.leaveMinutes) : 0;
  const effectiveLeave = Math.min(target, Math.max(recordLeave, registeredLeave));
  const holiday = getHolidayInfo(date, {
    mode: data.settings.mode,
    manualHoliday: Boolean(base.holiday),
    includeOfficialHolidays: data.settings.autoOfficialHolidays,
    includeWeeklyHoliday: data.settings.autoWeeklyHoliday,
    overrides: data.holidayOverrides,
  });
  return {
    ...base,
    holiday: holiday.isHoliday,
    leaveType: effectiveLeave >= target && target > 0 ? "full" as const : effectiveLeave > 0 ? "hourly" as const : "none" as const,
    leaveMinutes: effectiveLeave >= target ? 0 : effectiveLeave,
  };
}
