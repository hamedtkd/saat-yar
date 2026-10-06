"use client";

import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { getAppliedReportFilters, getReportPrintRange } from "@/lib/report-print";
import type { AppData, Mode, ReportFilter, TimeEntry, WorkRecord } from "@/lib/types";

export function ReportPrintHeader({
  mode,
  filters,
  data,
  monthRecords,
  entries,
}: {
  mode: Mode;
  filters: ReportFilter;
  data: AppData;
  monthRecords: WorkRecord[];
  entries: TimeEntry[];
}) {
  const { t, date, number } = useLocaleUi();
  const range = getReportPrintRange(mode, filters, monthRecords, entries);
  const period = range.from || range.to
    ? [range.from ? date(range.from, { day: "numeric", month: "long", year: "numeric" }) : "", range.to ? date(range.to, { day: "numeric", month: "long", year: "numeric" }) : ""].filter(Boolean).join(" – ")
    : t("reports.print.allDates");
  const workspace = mode === "employee" ? t("mode.employee") : mode === "freelancer" ? t("mode.freelancer") : t("mode.hybrid");
  const recordCount = mode === "employee" ? monthRecords.length : entries.length;
  const appliedFilters = getAppliedReportFilters({
    mode,
    filters,
    clients: data.clients,
    projects: data.projects,
    labels: {
      from: t("reports.filters.fromDate"),
      to: t("reports.filters.toDate"),
      client: t("common.client"),
      project: t("common.project"),
      status: t("reports.print.recordStatus"),
      billable: t("reports.filters.billableStatus"),
      search: t("reports.print.search"),
    },
    translate: t,
    formatDate: (value) => date(value, { day: "numeric", month: "long", year: "numeric" }),
  });

  return (
    <section className="report-print-header hidden print:block">
      <div className="report-print-header-main">
        <div>
          <div className="report-print-brand">{t("reports.print.brand")}</div>
          <h1>{mode === "employee" ? t("reports.employeeTitle") : t("reports.freelancerTitle")}</h1>
        </div>
        <div className="report-print-meta">
          <div><span>{t("reports.print.period")}</span><strong>{period}</strong></div>
          <div><span>{t("reports.print.workspace")}</span><strong>{workspace}</strong></div>
          <div><span>{t("reports.print.records")}</span><strong>{number(recordCount)}</strong></div>
          <div><span>{t("reports.print.generatedAt")}</span><strong>{date(new Date(), { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</strong></div>
        </div>
      </div>
      {appliedFilters.length > 0 && (
        <div className="report-print-filters">
          <h2>{t("reports.print.appliedFilters")}</h2>
          <dl>{appliedFilters.map((filter) => <div key={filter.key}><dt>{filter.label}</dt><dd>{filter.value}</dd></div>)}</dl>
        </div>
      )}
    </section>
  );
}
