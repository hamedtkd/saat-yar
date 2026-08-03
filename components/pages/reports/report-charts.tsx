"use client";

import { EmployeeCharts } from "./charts/employee-charts";
import { FreelancerCharts } from "./charts/freelancer-charts";
import type { ReportChartsProps } from "./charts/types";

export function ReportCharts({ mode, entries, reportBillable, monthRecords, monthStats, settings }: ReportChartsProps) {
  if (mode === "employee") {
    return <EmployeeCharts monthRecords={monthRecords} monthStats={monthStats} settings={settings} />;
  }
  return <FreelancerCharts entries={entries} reportBillable={reportBillable} />;
}
