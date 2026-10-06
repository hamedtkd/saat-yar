import { useMemo } from "react";

import { createReportSummary } from "@/lib/report-summary";
import type { AppData, ReportFilter, TimeEntry, WorkRecord } from "@/lib/types";

type ReportSummaryInput = {
  data: AppData;
  monthRecords: WorkRecord[];
  entries: TimeEntry[];
  reportBillable: number;
  filters?: ReportFilter;
  reportMode?: "employee" | "freelancer";
};

export function useReportSummary(input: ReportSummaryInput) {
  const { data, entries, monthRecords, reportBillable, filters, reportMode } = input;
  return useMemo(
    () =>
      createReportSummary({
        data,
        entries,
        monthRecords,
        reportBillable,
        filters,
        reportMode,
      }),
    [data, entries, monthRecords, reportBillable, filters, reportMode],
  );
}
