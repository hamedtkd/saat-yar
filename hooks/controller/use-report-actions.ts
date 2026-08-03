import { exportCsv, exportExcel } from "@/lib/exporters";
import { entryMinutes, localDateKey } from "@/lib/format";
import { calc } from "@/lib/time-engine";
import { getDailyTargetMinutes } from "@/lib/work-schedule";
import type { AppData, TimeEntry, WorkRecord } from "@/lib/types";

type Args = { data: AppData; filteredEntries: TimeEntry[]; filteredMonthRecords: WorkRecord[]; setToast: (message: string) => void };
const FREELANCER_HEADERS = ["تاریخ", "مشتری", "پروژه", "شرح", "مدت (دقیقه)", "نرخ مؤثر", "مبلغ", "قابل صورتحساب"];

export function useReportActions({ data, filteredEntries, filteredMonthRecords, setToast }: Args) {
  function freelancerRows() {
    return filteredEntries.map((entry) => {
      const project = data.projects.find((item) => item.id === entry.projectId);
      const client = data.clients.find((item) => item.id === entry.clientId);
      const minutes = entryMinutes(entry);
      return [new Intl.DateTimeFormat("fa-IR-u-ca-persian").format(new Date(entry.startedAt)), client?.name ?? "", project?.name ?? "", entry.note,
        minutes, entry.effectiveRate, entry.billable ? Math.round(minutes / 60 * entry.effectiveRate) : 0, entry.billable ? "بله" : "خیر"];
    });
  }
  function exportReport(kind: "excel" | "csv") {
    const employeeMode = data.settings.mode === "employee";
    const headers = employeeMode ? ["تاریخ", "ورود", "خروج", "کارکرد", "مرخصی", "تراز", "تعطیل", "یادداشت"] : FREELANCER_HEADERS;
    const rows = employeeMode ? filteredMonthRecords.map((item) => {
      const result = calc(item, getDailyTargetMinutes(item.date, data.settings));
      return [item.date, item.start, item.end, result.worked, result.leave, result.balance, item.holiday ? "بله" : "خیر", item.note];
    }) : freelancerRows();
    const fileBase = employeeMode ? "گزارش-کارکرد" : "گزارش-صورتحساب";
    if (kind === "excel") exportExcel(`${fileBase}-${localDateKey()}.xls`, employeeMode ? "گزارش کارکرد" : "گزارش صورتحساب", headers, rows);
    else exportCsv(`${fileBase}-${localDateKey()}.csv`, headers, rows);
    setToast(`گزارش ${kind === "excel" ? "Excel" : "CSV"} دانلود شد`);
  }
  return { exportReport };
}
