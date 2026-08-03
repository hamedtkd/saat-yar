import type { AppData, Mode, Settings, TimeEntry, WorkRecord } from "@/lib/types";
import { EmployeeReportTable } from "./table/employee-report-table";
import { FreelancerReportTable } from "./table/freelancer-report-table";
import { PrintPreviewAside } from "./table/print-preview-aside";

type ReportTableProps = {
  mode: Mode;
  data: AppData;
  entries: TimeEntry[];
  monthRecords: WorkRecord[];
  settings?: Settings;
  financialsHidden?: boolean;
};

export function ReportTable({ mode, data, entries, monthRecords, settings = data.settings, financialsHidden = false }: ReportTableProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
      {mode === "employee" ? (
        <EmployeeReportTable monthRecords={monthRecords} settings={settings} financialsHidden={financialsHidden} />
      ) : (
        <FreelancerReportTable data={data} entries={entries} financialsHidden={financialsHidden} />
      )}
      <PrintPreviewAside mode={mode} />
    </section>
  );
}
