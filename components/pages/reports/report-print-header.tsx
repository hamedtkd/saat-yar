"use client";

import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import type { Mode, ReportFilter, TimeEntry, WorkRecord } from "@/lib/types";

function minDate(values: string[]) {
  return values.filter(Boolean).sort((a, b) => a.localeCompare(b))[0] ?? "";
}
function maxDate(values: string[]) {
  return values.filter(Boolean).sort((a, b) => b.localeCompare(a))[0] ?? "";
}

export function ReportPrintHeader({
  mode,
  filters,
  monthRecords,
  entries,
}: {
  mode: Mode;
  filters: ReportFilter;
  monthRecords: WorkRecord[];
  entries: TimeEntry[];
}) {
  const { t, date, number } = useLocaleUi();
  const sourceDates = mode === "employee"
    ? monthRecords.map((record) => record.date)
    : entries.map((entry) => entry.startedAt.slice(0, 10));
  const from = filters.dateFrom || minDate(sourceDates);
  const to = filters.dateTo || maxDate(sourceDates);
  const period = from || to
    ? [from ? date(from, { day: "numeric", month: "long", year: "numeric" }) : "", to ? date(to, { day: "numeric", month: "long", year: "numeric" }) : ""].filter(Boolean).join(" – ")
    : t("reports.print.allDates");
  const workspace = mode === "employee" ? t("mode.employee") : mode === "freelancer" ? t("mode.freelancer") : t("mode.hybrid");
  const recordCount = mode === "employee" ? monthRecords.length : entries.length;

  return (
    <section className="report-print-header hidden print:block" aria-hidden="true">
      <div className="report-print-header-main">
        <div>
          <div className="report-print-brand">{t("reports.print.brand")}</div>
          <h1>{mode === "employee" ? t("reports.employeeTitle") : t("reports.freelancerTitle")}</h1>
        </div>
        <div className="report-print-meta">
          <div><span>{t("reports.print.period")}</span><strong>{period}</strong></div>
          <div><span>{t("reports.print.workspace")}</span><strong>{workspace}</strong></div>
          <div><span>{t("reports.print.records")}</span><strong>{number(recordCount)}</strong></div>
          <div><span>{t("reports.print.generatedAt")}</span><strong>{date(new Date().toISOString(), { day: "numeric", month: "long", year: "numeric" })}</strong></div>
        </div>
      </div>
    </section>
  );
}
