import { exportCsv, exportExcel } from "../../lib/exporters.ts";
import { entryMinutes, localDateKey } from "../../lib/format.ts";
import { getBrowserLocale, translate, type CalendarSystem, type Locale, type MessageKey } from "../../lib/i18n/index.ts";
import { formatLocaleDate } from "../../lib/i18n/formatters.ts";
import { getFreelancerReportDescription } from "../../lib/freelancer-report-description.ts";
import { getEmployeeDayPay } from "../../lib/employee-report.ts";
import { calculateReportPayroll } from "../../lib/report-payroll.ts";
import { calc } from "../../lib/time-engine.ts";
import { getDailyTargetMinutes } from "../../lib/work-schedule.ts";
import type { AppData, ReportFilter, TimeEntry, WorkRecord } from "../../lib/types.ts";

type Args = { data: AppData; filteredEntries: TimeEntry[]; reportRecords: WorkRecord[]; reportFilter: ReportFilter; calendar: CalendarSystem; setToast: (message: string) => void };

const EMPLOYEE_HEADERS: MessageKey[] = [
  "reports.export.employee.date",
  "reports.export.employee.start",
  "reports.export.employee.end",
  "reports.export.employee.worked",
  "reports.export.employee.leave",
  "reports.export.employee.balance",
  "reports.export.employee.holiday",
  "reports.export.employee.note",
  "reports.export.employee.lunch",
  "reports.export.employee.lunchPaid",
  "reports.export.employee.breaks",
  "reports.export.employee.breakCount",
  "reports.export.employee.leaveType",
  "reports.export.employee.estimatedSalary",
  "reports.export.employee.rangePayroll",
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

export function useReportActions({ data, filteredEntries, reportRecords, reportFilter, calendar, setToast }: Args) {
  function freelancerRows(locale: Locale) {
    return filteredEntries.map((entry) => {
      const project = data.projects.find((item) => item.id === entry.projectId);
      const client = data.clients.find((item) => item.id === entry.clientId);
      const minutes = entryMinutes(entry);
      return [
        formatLocaleDate(locale, entry.startedAt, { year: "numeric", month: "2-digit", day: "2-digit" }, calendar),
        client?.name ?? "",
        project?.name ?? "",
        getFreelancerReportDescription(entry),
        minutes,
        entry.effectiveRate,
        entry.billable ? Math.round(minutes / 60 * entry.effectiveRate) : 0,
        translate(locale, entry.billable ? "reports.export.yes" : "reports.export.no"),
      ];
    });
  }

  async function exportReport(kind: "excel" | "csv", reportMode: "employee" | "freelancer" = data.settings.mode === "employee" ? "employee" : "freelancer") {
    const locale = getBrowserLocale();
    try {
      const employeeMode = reportMode === "employee";
      const headers = (employeeMode ? EMPLOYEE_HEADERS : FREELANCER_HEADERS).map((key) => translate(locale, key));
      const reportPayroll = employeeMode ? calculateReportPayroll(data, reportRecords, reportFilter).net : null;
      const rows = employeeMode ? reportRecords.map((item) => {
        const dailyTarget = getDailyTargetMinutes(item.date, data.settings);
        const result = calc(item, dailyTarget);
        return [
          formatLocaleDate(locale, item.date, { year: "numeric", month: "2-digit", day: "2-digit" }, calendar),
          item.start,
          item.end,
          result.worked,
          result.leave,
          result.balance,
          translate(locale, item.holiday ? "reports.export.yes" : "reports.export.no"),
          item.note,
          item.lunchMinutes,
          translate(locale, item.lunchPaid ? "reports.export.yes" : "reports.export.no"),
          result.breakMinutes,
          item.breaks.length,
          result.leave > 0 ? translate(locale, item.leaveType === "hourly" ? "reports.table.hourlyLeave" : "reports.table.leaveRecorded") : "",
          getEmployeeDayPay({ record: item, settings: data.settings, dailyTarget }),
          null,
        ];
      }) : freelancerRows(locale);
      if (employeeMode) {
        const rangePayrollRow: (string | number | null)[] = Array.from({ length: EMPLOYEE_HEADERS.length }, () => "");
        rangePayrollRow[7] = translate(locale, "reports.export.employee.rangePayrollLabel");
        rangePayrollRow[14] = reportPayroll;
        rows.push(rangePayrollRow);
      }
      const fileBase = translate(locale, employeeMode ? "reports.export.employeeFile" : "reports.export.freelancerFile");
      if (kind === "excel") {
        await exportExcel(
          `${fileBase}-${localDateKey()}.xlsx`,
          translate(locale, employeeMode ? "reports.export.employeeTitle" : "reports.export.freelancerTitle"),
          headers,
          rows,
          locale,
        );
      } else {
        exportCsv(`${fileBase}-${localDateKey()}.csv`, headers, rows);
      }
      setToast(translate(locale, "reports.export.downloaded", { kind: kind === "excel" ? "Excel" : "CSV" }));
    } catch {
      setToast(translate(locale, "reports.export.failed"));
    }
  }
  return { exportReport };
}
