"use client";

import { Activity, BarChart3, FileBarChart2, SlidersHorizontal, TableProperties } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { SectionHeading } from "@/components/common/section-heading";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { ReportCharts } from "./report-charts";
import { ReportFilters } from "./report-filters";
import { ReportTable } from "./report-table";
import { EmployeeSummary } from "./overview/employee-summary";
import { FinancialChartsGuard } from "./overview/financial-charts-guard";
import { FreelancerSummary } from "./overview/freelancer-summary";
import { MonthSummary } from "./overview/month-summary";
import { ActivityBreakdown } from "./overview/activity-breakdown";
import { ReportActions } from "./overview/report-actions";
import type { ReportsPageProps } from "./overview/types";
import { useReportSummary } from "./overview/use-report-summary";

export function ReportsPage({ data, monthRecords, monthStats, filters, setFilters, entries, reportBillable, reportIncome, exportReport, financialsHidden }: ReportsPageProps) {
  const { t } = useLocaleUi();
  const summary = useReportSummary({ data, monthRecords, monthStats, entries, reportBillable });
  const mode = data.settings.mode;
  return <>
    <PageHeading title={summary.isEmployee ? t("reports.employeeTitle") : t("reports.freelancerTitle")} description={summary.isEmployee ? t("reports.employeeDescription") : t("reports.freelancerDescription")}><ReportActions onExport={exportReport} /></PageHeading>
    <section className="mb-5"><SectionHeading icon={<SlidersHorizontal />} eyebrow={t("reports.filtersEyebrow")} title={t("reports.filtersTitle")} description={t("reports.filtersDescription")} /><ReportFilters mode={mode} data={data} filters={filters} setFilters={setFilters} /></section>
    <section className="mb-5"><SectionHeading icon={<FileBarChart2 />} eyebrow={t("reports.summaryEyebrow")} title={summary.isEmployee ? t("reports.employeeSummaryTitle") : t("reports.freelancerSummaryTitle")} description={t("reports.summaryDescription")} />{summary.isEmployee ? <EmployeeSummary stats={summary.effectiveMonthStats} records={monthRecords} overtimeMinutes={summary.overtimeMinutes} deficitMinutes={summary.deficitMinutes} payroll={summary.payroll} financialsHidden={financialsHidden} /> : <FreelancerSummary stats={summary.effectiveMonthStats} totalProjectTime={summary.totalProjectTime} reportBillable={reportBillable} nonBillableMinutes={summary.nonBillableMinutes} reportIncome={reportIncome} financialsHidden={financialsHidden} />}</section>
    <section className="mb-5"><SectionHeading icon={<Activity />} eyebrow={t("reports.activity.eyebrow")} title={t("reports.activity.title")} description={t("reports.activity.description")} /><ActivityBreakdown records={monthRecords} /></section>
    <FinancialChartsGuard hidden={financialsHidden && mode !== "employee"}><section className="mb-5 print:hidden"><SectionHeading icon={<BarChart3 />} eyebrow={t("reports.chartsEyebrow")} title={t("reports.chartsTitle")} description={t("reports.chartsDescription")} /><div className="report-charts"><ReportCharts mode={mode} entries={entries} reportBillable={reportBillable} monthRecords={monthRecords} monthStats={summary.effectiveMonthStats} settings={data.settings} /></div></section></FinancialChartsGuard>
    <section className="mb-5"><SectionHeading icon={<TableProperties />} eyebrow={t("reports.recordsEyebrow")} title={t("reports.recordsTitle")} description={t("reports.recordsDescription")} /><ReportTable mode={mode} data={data} entries={entries} monthRecords={monthRecords} financialsHidden={financialsHidden} /><MonthSummary isEmployee={summary.isEmployee} recordCount={monthRecords.length} stats={summary.effectiveMonthStats} /></section>
  </>;
}
