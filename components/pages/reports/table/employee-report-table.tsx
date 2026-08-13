"use client";

import { FileSpreadsheet, Filter } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PanelHead } from "@/components/common/panel-head";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { cn } from "@/lib/cn";
import type { Settings, WorkRecord } from "@/lib/types";
import { EmployeeDesktopTable } from "./employee-desktop-table";
import { EmployeeMobileCards } from "./employee-mobile-cards";
import { getEmployeeTotals } from "./report-table-shared";

type Props = { monthRecords: WorkRecord[]; settings: Settings; financialsHidden: boolean };
export function EmployeeReportTable({ monthRecords, settings, financialsHidden }: Props) {
  const { t, number } = useLocaleUi();
  const totals = getEmployeeTotals(monthRecords, settings);
  return <article className={cn("min-w-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-glass)] shadow-[0_10px_35px_rgba(17,45,55,0.055)]")}>
    <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5"><PanelHead icon={<FileSpreadsheet />} title={t("reports.table.employeeTitle")} />{monthRecords.length > 0 && <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-[10px] font-bold text-[var(--text-muted)]">{t("common.daysRecorded", { count: number(monthRecords.length) })}</span>}</div>
    {monthRecords.length > 0 ? <><EmployeeDesktopTable monthRecords={monthRecords} settings={settings} totals={totals} financialsHidden={financialsHidden} /><EmployeeMobileCards monthRecords={monthRecords} settings={settings} totals={totals} financialsHidden={financialsHidden} /></> : <div className="p-4 sm:p-5"><EmptyState icon={<Filter />} title={t("reports.table.employeeEmpty")} description={t("reports.table.employeeEmptyHint")} /></div>}
  </article>;
}
