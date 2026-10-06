import { entryMinutes } from "./format.ts";
import { derivePayrollPeriodFacts } from "./payroll-period.ts";
import { calculateReportPayroll } from "./report-payroll.ts";
import { calc } from "./time-engine.ts";
import { getDailyTargetMinutes } from "./work-schedule.ts";
import type { AppData, ReportFilter, TimeEntry, WorkRecord } from "./types.ts";

export type ReportMonthStats = {
  worked: number;
  target: number;
  balance: number;
  breaks: number;
};

export type ReportSummaryInput = {
  data: AppData;
  monthRecords: WorkRecord[];
  entries: TimeEntry[];
  reportBillable: number;
  filters?: ReportFilter;
  reportMode?: "employee" | "freelancer";
};

export function createReportSummary({
  data,
  monthRecords,
  entries,
  reportBillable,
  filters,
  reportMode,
}: ReportSummaryInput) {
  const isEmployee = (reportMode ?? data.settings.mode) === "employee";
  const visibleMonthStats = monthRecords.reduce<ReportMonthStats>((totals, record) => {
    const target = getDailyTargetMinutes(record.date, data.settings);
    const result = calc(record, target);
    totals.worked += result.worked;
    totals.target += record.holiday ? 0 : target;
    totals.balance += result.balance;
    totals.breaks += result.breakMinutes + result.unpaidLunchMinutes;
    return totals;
  }, { worked: 0, target: 0, balance: 0, breaks: 0 });

  const effectiveMonthStats = visibleMonthStats;
  const totalProjectTime = entries.reduce((sum, entry) => sum + entryMinutes(entry), 0);
  const nonBillableMinutes = Math.max(0, totalProjectTime - reportBillable);
  const payrollFacts = derivePayrollPeriodFacts(monthRecords, data.settings);
  const payroll = calculateReportPayroll(data, monthRecords, filters);

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
