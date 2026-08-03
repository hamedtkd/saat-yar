"use client";

import { ReportsPage } from "@/components/pages/reports/reports-page";
import { useSaatyarContext } from "@/components/saatyar-shell";

export default function ReportsRoute() {
  const controller = useSaatyarContext();
  if (!controller.ready) return null;

  return (
    <ReportsPage
      data={controller.data}
      monthRecords={controller.monthRecords}
      monthStats={controller.monthStats}
      filters={controller.reportFilter}
      setFilters={controller.setReportFilter}
      entries={controller.filteredEntries}
      reportBillable={controller.reportBillable}
      reportIncome={controller.reportIncome}
      exportReport={controller.exportReport}
    />
  );
}
