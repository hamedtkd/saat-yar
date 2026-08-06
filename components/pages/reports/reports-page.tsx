import { PageHeading } from "@/components/common/page-heading";

import { ReportCharts } from "./report-charts";
import { ReportFilters } from "./report-filters";
import { ReportTable } from "./report-table";
import { EmployeeSummary } from "./overview/employee-summary";
import { FinancialChartsGuard } from "./overview/financial-charts-guard";
import { FreelancerSummary } from "./overview/freelancer-summary";
import { MonthSummary } from "./overview/month-summary";
import { ReportActions } from "./overview/report-actions";
import type { ReportsPageProps } from "./overview/types";
import { useReportSummary } from "./overview/use-report-summary";

export function ReportsPage({
  data,
  monthRecords,
  monthStats,
  filters,
  setFilters,
  entries,
  reportBillable,
  reportIncome,
  exportReport,
  financialsHidden,
}: ReportsPageProps) {
  const summary = useReportSummary({
    data,
    monthRecords,
    monthStats,
    entries,
    reportBillable,
  });
  const mode = data.settings.mode;

  return (
    <>
      <PageHeading
        title={summary.isEmployee ? "گزارش کارکرد و حقوق" : "گزارش کار و درآمد"}
        description={
          summary.isEmployee
            ? "جمع‌بندی حضور، کارکرد، اضافه‌کاری، کسری و وضعیت این ماه."
            : "جمع‌بندی شفاف زمان، صورتحساب و عملکرد این ماه."
        }
      >
        <ReportActions onExport={exportReport} />
      </PageHeading>

      <ReportFilters mode={mode} data={data} filters={filters} setFilters={setFilters} />

      {summary.isEmployee ? (
        <EmployeeSummary
          stats={summary.effectiveMonthStats}
          records={monthRecords}
          overtimeMinutes={summary.overtimeMinutes}
          deficitMinutes={summary.deficitMinutes}
          payroll={summary.payroll}
          financialsHidden={financialsHidden}
        />
      ) : (
        <FreelancerSummary
          stats={summary.effectiveMonthStats}
          totalProjectTime={summary.totalProjectTime}
          reportBillable={reportBillable}
          nonBillableMinutes={summary.nonBillableMinutes}
          reportIncome={reportIncome}
          financialsHidden={financialsHidden}
        />
      )}

      <FinancialChartsGuard hidden={financialsHidden && mode !== "employee"}>
        <div className="report-charts print:hidden">
          <ReportCharts
          mode={mode}
          entries={entries}
          reportBillable={reportBillable}
          monthRecords={monthRecords}
          monthStats={summary.effectiveMonthStats}
          settings={data.settings}
          />
        </div>
      </FinancialChartsGuard>

      <ReportTable mode={mode} data={data} entries={entries} monthRecords={monthRecords} financialsHidden={financialsHidden} />
      <MonthSummary isEmployee={summary.isEmployee} recordCount={monthRecords.length} stats={summary.effectiveMonthStats} />
    </>
  );
}
