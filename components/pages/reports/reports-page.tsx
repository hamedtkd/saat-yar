"use client";

import { useState } from "react";
import { Activity, BarChart3, FileBarChart2, SlidersHorizontal, TableProperties } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { SectionHeading } from "@/components/common/section-heading";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import type { Mode } from "@/lib/types";
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
import { ReportPrintHeader } from "./report-print-header";

type ReportMode = Extract<Mode, "employee" | "freelancer">;

export function ReportsPage({ data, monthRecords, filters, setFilters, entries, reportBillable, reportIncome, exportReport, financialsHidden }: ReportsPageProps) {
  const { t } = useLocaleUi();
  const [hybridReportMode, setHybridReportMode] = useState<ReportMode>("employee");
  const mode: ReportMode = data.settings.mode === "hybrid" ? hybridReportMode : data.settings.mode;
  const isEmployee = mode === "employee";
  const summary = useReportSummary({ data, monthRecords, entries, reportBillable, filters, reportMode: mode });
  return <div className="report-page" data-report-print-root>
    <ReportPrintHeader mode={mode} filters={filters} data={data} monthRecords={monthRecords} entries={entries} />
    <div className="print:hidden"><PageHeading title={isEmployee ? t("reports.employeeTitle") : t("reports.freelancerTitle")} description={isEmployee ? t("reports.employeeDescription") : t("reports.freelancerDescription")}><ReportActions mode={mode} onExport={(kind, reportMode) => exportReport(kind, reportMode)} /></PageHeading></div>
    {data.settings.mode === "hybrid" && <div role="group" aria-label={t("reports.hybrid.tabs")} className="mb-5 inline-flex gap-1 rounded-[var(--control-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-1 print:hidden">
      {(["employee", "freelancer"] as const).map((item) => <Button key={item} type="button" aria-pressed={mode === item} variant={mode === item ? "default" : "ghost"} onClick={() => setHybridReportMode(item)}>{t(item === "employee" ? "mode.employee" : "mode.freelancer")}</Button>)}
    </div>}
    <section className="mb-5 print:hidden"><SectionHeading icon={<SlidersHorizontal />} eyebrow={t("reports.filtersEyebrow")} title={t("reports.filtersTitle")} description={t("reports.filtersDescription")} /><ReportFilters mode={mode} data={data} filters={filters} setFilters={setFilters} /></section>
    <section className="report-print-section mb-5"><SectionHeading icon={<FileBarChart2 />} eyebrow={t("reports.summaryEyebrow")} title={isEmployee ? t("reports.employeeSummaryTitle") : t("reports.freelancerSummaryTitle")} description={t("reports.summaryDescription")} />{isEmployee ? <EmployeeSummary stats={summary.effectiveMonthStats} records={monthRecords} overtimeMinutes={summary.overtimeMinutes} deficitMinutes={summary.deficitMinutes} payroll={summary.payroll} financialsHidden={financialsHidden} /> : <FreelancerSummary totalProjectTime={summary.totalProjectTime} reportBillable={reportBillable} nonBillableMinutes={summary.nonBillableMinutes} reportIncome={reportIncome} financialsHidden={financialsHidden} />}</section>
    {isEmployee && <section className="report-print-section mb-5"><SectionHeading icon={<Activity />} eyebrow={t("reports.activity.eyebrow")} title={t("reports.activity.title")} description={t("reports.activity.description")} /><ActivityBreakdown records={monthRecords} /></section>}
    <FinancialChartsGuard hidden={financialsHidden && !isEmployee}><section className="report-print-section report-print-charts mb-5"><SectionHeading icon={<BarChart3 />} eyebrow={t("reports.chartsEyebrow")} title={t("reports.chartsTitle")} description={t("reports.chartsDescription")} /><div className="report-charts"><ReportCharts mode={mode} entries={entries} reportBillable={reportBillable} monthRecords={monthRecords} monthStats={summary.effectiveMonthStats} settings={data.settings} /></div></section></FinancialChartsGuard>
    <section className="report-print-section mb-5"><SectionHeading icon={<TableProperties />} eyebrow={t("reports.recordsEyebrow")} title={t("reports.recordsTitle")} description={t("reports.recordsDescription")} /><ReportTable mode={mode} data={data} entries={entries} monthRecords={monthRecords} financialsHidden={financialsHidden} />{isEmployee && <MonthSummary isEmployee recordCount={monthRecords.length} stats={summary.effectiveMonthStats} />}</section>
  </div>;
}
