"use client";

import { FileSpreadsheet, Filter } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PanelHead } from "@/components/common/panel-head";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { cn } from "@/lib/cn";
import type { AppData, TimeEntry } from "@/lib/types";
import { FreelancerDesktopTable } from "./freelancer-desktop-table";
import { FreelancerMobileCards } from "./freelancer-mobile-cards";

type Props = { data: AppData; entries: TimeEntry[]; financialsHidden: boolean };
export function FreelancerReportTable({ data, entries, financialsHidden }: Props) {
  const { t, number } = useLocaleUi();
  return <article className={cn("min-w-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-glass)] shadow-[0_10px_35px_rgba(17,45,55,0.055)]")}>
    <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5"><PanelHead icon={<FileSpreadsheet />} title={t("reports.table.freelancerTitle")} />{entries.length > 0 && <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-[10px] font-bold text-[var(--text-muted)]">{t("reports.table.recordsCount", { count: number(entries.length) })}</span>}</div>
    {entries.length > 0 ? <><FreelancerDesktopTable data={data} entries={entries} financialsHidden={financialsHidden} /><FreelancerMobileCards data={data} entries={entries} financialsHidden={financialsHidden} /></> : <div className="p-4 sm:p-5"><EmptyState icon={<Filter />} title={t("reports.table.freelancerEmpty")} description={t("reports.table.freelancerEmptyHint")} /></div>}
  </article>;
}
