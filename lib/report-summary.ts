import { entryMinutes } from "./format.ts";
import { calculateMonthlyPayrollForSettings } from "./payroll.ts";
import { derivePayrollPeriodFacts } from "./payroll-period.ts";
import { calc } from "./time-engine.ts";
import { getDailyTargetMinutes } from "./work-schedule.ts";
import type { AppData, TimeEntry, WorkRecord } from "./types.ts";

export type ReportMonthStats = {
  worked: number;
  target: number;
  balance: number;
  breaks: number;
};

export type ReportSummaryInput = {
  data: AppData;
  monthRecords: WorkRecord[];
  monthStats: ReportMonthStats;
  entries: TimeEntry[];
  reportBillable: number;
};

export function createReportSummary({
  data,
  monthRecords,
  monthStats,
  entries,
  reportBillable,
}: ReportSummaryInput) {
  const isEmployee = data.settings.mode === "employee";
  const visibleMonthStats = monthRecords.reduce<ReportMonthStats>((totals, record) => {
    const target = getDailyTargetMinutes(record.date, data.settings);
    const result = calc(record, target);
    totals.worked += result.worked;
    totals.target += record.holiday ? 0 : target;
    totals.balance += result.balance;
    totals.breaks += result.breakMinutes + result.unpaidLunchMinutes;
    return totals;
  }, { worked: 0, target: 0, balance: 0, breaks: 0 });

  const effectiveMonthStats = isEmployee ? visibleMonthStats : monthStats;
  const totalProjectTime = entries.reduce((sum, entry) => sum + entryMinutes(entry), 0);
  const nonBillableMinutes = Math.max(0, totalProjectTime - reportBillable);
  const payrollFacts = derivePayrollPeriodFacts(monthRecords, data.settings);
  const payroll = calculateMonthlyPayrollForSettings(data.settings, payrollFacts);

  return {
    isEmployee,
    effectiveMonthStats,
    totalProjectTime,
    nonBillableMinutes,
    deficitMinutes: payrollFacts.deficitMinutes,
    overtimeMinutes: payrollFacts.overtimeMinutes,
    payroll,
  };
}
