import { useMemo } from "react";

import { createReportSummary } from "@/lib/report-summary";
import type { AppData, TimeEntry, WorkRecord } from "@/lib/types";

import type { MonthStats } from "./types";

type ReportSummaryInput = {
  data: AppData;
  monthRecords: WorkRecord[];
  monthStats: MonthStats;
  entries: TimeEntry[];
  reportBillable: number;
};

export function useReportSummary(input: ReportSummaryInput) {
  const { data, entries, monthRecords, monthStats, reportBillable } = input;
  return useMemo(
    () =>
      createReportSummary({
        data,
        entries,
        monthRecords,
        monthStats,
        reportBillable,
      }),
    [data, entries, monthRecords, monthStats, reportBillable],
  );
}
