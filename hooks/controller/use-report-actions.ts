import { exportCsv, exportExcel } from "@/lib/exporters";
import { entryMinutes, localDateKey } from "@/lib/format";
import { getBrowserLocale, translate, type Locale, type MessageKey } from "@/lib/i18n";
import { formatLocaleDate } from "@/lib/i18n/formatters";
import { calc } from "@/lib/time-engine";
import { getDailyTargetMinutes } from "@/lib/work-schedule";
import type { AppData, TimeEntry, WorkRecord } from "@/lib/types";

type Args = { data: AppData; filteredEntries: TimeEntry[]; filteredMonthRecords: WorkRecord[]; setToast: (message: string) => void };

const EMPLOYEE_HEADERS: MessageKey[] = [
  "reports.export.employee.date",
  "reports.export.employee.start",
  "reports.export.employee.end",
  "reports.export.employee.worked",
  "reports.export.employee.leave",
  "reports.export.employee.balance",
  "reports.export.employee.holiday",
  "reports.export.employee.note",
];

const FREELANCER_HEADERS: MessageKey[] = [
  "reports.export.freelancer.date",
  "reports.export.freelancer.client",
  "reports.export.freelancer.project",
  "reports.export.freelancer.description",
  "reports.export.freelancer.durationMinutes",
  "reports.export.freelancer.effectiveRate",
  "reports.export.freelancer.amount",
  "reports.export.freelancer.billable",
];

export function useReportActions({ data, filteredEntries, filteredMonthRecords, setToast }: Args) {
  function freelancerRows(locale: Locale) {
    return filteredEntries.map((entry) => {
      const project = data.projects.find((item) => item.id === entry.projectId);
      const client = data.clients.find((item) => item.id === entry.clientId);
      const minutes = entryMinutes(entry);
      return [
        formatLocaleDate(locale, entry.startedAt, { year: "numeric", month: "2-digit", day: "2-digit" }),
        client?.name ?? "",
        project?.name ?? "",
        entry.note,
        minutes,
        entry.effectiveRate,
        entry.billable ? Math.round(minutes / 60 * entry.effectiveRate) : 0,
        translate(locale, entry.billable ? "reports.export.yes" : "reports.export.no"),
      ];
    });
  }

  function exportReport(kind: "excel" | "csv") {
    const locale = getBrowserLocale();
    const employeeMode = data.settings.mode === "employee";
    const headers = (employeeMode ? EMPLOYEE_HEADERS : FREELANCER_HEADERS).map((key) => translate(locale, key));
    const rows = employeeMode ? filteredMonthRecords.map((item) => {
      const result = calc(item, getDailyTargetMinutes(item.date, data.settings));
      return [
        formatLocaleDate(locale, item.date, { year: "numeric", month: "2-digit", day: "2-digit" }),
        item.start,
        item.end,
        result.worked,
        result.leave,
        result.balance,
        translate(locale, item.holiday ? "reports.export.yes" : "reports.export.no"),
        item.note,
      ];
    }) : freelancerRows(locale);
    const fileBase = translate(locale, employeeMode ? "reports.export.employeeFile" : "reports.export.freelancerFile");
    if (kind === "excel") {
      exportExcel(
        `${fileBase}-${localDateKey()}.xls`,
        translate(locale, employeeMode ? "reports.export.employeeTitle" : "reports.export.freelancerTitle"),
        headers,
        rows,
      );
    } else {
      exportCsv(`${fileBase}-${localDateKey()}.csv`, headers, rows);
    }
    setToast(translate(locale, "reports.export.downloaded", { kind: kind === "excel" ? "Excel" : "CSV" }));
  }
  return { exportReport };
}
