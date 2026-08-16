import { useMemo } from "react";

import { entryMinutes } from "@/lib/format";
import { calculateMonthlyPayrollForSettings } from "@/lib/payroll";
import { derivePayrollPeriodFacts } from "@/lib/payroll-period";
import { calc } from "@/lib/time-engine";
import { getDailyTargetMinutes } from "@/lib/work-schedule";
import type { AppData, TimeEntry, WorkRecord } from "@/lib/types";

import type { MonthStats } from "./types";

type ReportSummaryInput = {
  data: AppData;
  monthRecords: WorkRecord[];
  monthStats: MonthStats;
  entries: TimeEntry[];
  reportBillable: number;
};

export function useReportSummary({
  data,
  monthRecords,
  monthStats,
  entries,
  reportBillable,
}: ReportSummaryInput) {
  return useMemo(() => {
    const isEmployee = data.settings.mode === "employee";
    const visibleMonthStats = monthRecords.reduce<MonthStats>((totals, record) => {
      const target = getDailyTargetMinutes(record.date, data.settings);
      const result = calc(record, target);
      totals.worked += result.worked;
      totals.target += record.holiday ? 0 : target;
      totals.balance += result.balance;
      totals.breaks += result.breakMinutes + result.unpaidLunchMinutes;
      return totals;
    }, { worked: 0, target: 0, balance: 0, breaks: 0 });

    const effectiveMonthStats = isEmployee ? visibleMonthStats : monthStats;
    const totalProjectTime = entries.reduce(
      (sum, entry) => sum + entryMinutes(entry),
      0,
    );
    const nonBillableMinutes = Math.max(0, totalProjectTime - reportBillable);
    const payrollFacts = derivePayrollPeriodFacts(monthRecords, data.settings);
    const deficitMinutes = payrollFacts.deficitMinutes;
    const overtimeMinutes = payrollFacts.overtimeMinutes;
    const payroll = calculateMonthlyPayrollForSettings(data.settings, payrollFacts);

    return {
      isEmployee,
      effectiveMonthStats,
      totalProjectTime,
      nonBillableMinutes,
      deficitMinutes,
      overtimeMinutes,
      payroll,
    };
  }, [data, entries, monthRecords, monthStats, reportBillable]);
}
