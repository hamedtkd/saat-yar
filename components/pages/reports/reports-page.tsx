import { BarChart3, FileBarChart2, SlidersHorizontal, TableProperties } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { SectionHeading } from "@/components/common/section-heading";

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

      <section className="mb-5">
        <SectionHeading icon={<SlidersHorizontal />} eyebrow="کنترل گزارش" title="فیلترها" description="بازه و وضعیت موردنظر را انتخاب کن؛ خروجی‌ها هم با همین فیلترها ساخته می‌شوند." />
        <ReportFilters mode={mode} data={data} filters={filters} setFilters={setFilters} />
      </section>

      <section className="mb-5">
        <SectionHeading icon={<FileBarChart2 />} eyebrow="خلاصه ماه" title={summary.isEmployee ? "کارکرد و پرداخت" : "زمان و درآمد"} description="شاخص‌های مهم ماه را بدون ورود به جزئیات مقایسه کن." />
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
      </section>

      <FinancialChartsGuard hidden={financialsHidden && mode !== "employee"}>
        <section className="mb-5 print:hidden">
          <SectionHeading icon={<BarChart3 />} eyebrow="روندها" title="نمودارهای تحلیلی" description="الگوی کارکرد و توزیع زمان را در طول ماه ببین." />
          <div className="report-charts">
            <ReportCharts
              mode={mode}
              entries={entries}
              reportBillable={reportBillable}
              monthRecords={monthRecords}
              monthStats={summary.effectiveMonthStats}
              settings={data.settings}
            />
          </div>
        </section>
      </FinancialChartsGuard>

      <section className="mb-5">
        <SectionHeading icon={<TableProperties />} eyebrow="جزئیات" title="رکوردهای گزارش" description="داده‌های فیلترشده را به‌صورت جدول یا کارت‌های موبایل مرور کن." />
        <ReportTable mode={mode} data={data} entries={entries} monthRecords={monthRecords} financialsHidden={financialsHidden} />
        <MonthSummary isEmployee={summary.isEmployee} recordCount={monthRecords.length} stats={summary.effectiveMonthStats} />
      </section>
    </>
  );
}
