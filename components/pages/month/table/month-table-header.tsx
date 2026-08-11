"use client";

import { FileSpreadsheet } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";

type MonthTableHeaderProps = { recordCount: number };

export function MonthTableHeader({ recordCount }: MonthTableHeaderProps) {
  const { t, number } = useLocaleUi();
  return <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5"><PanelHead icon={<FileSpreadsheet />} title={t("month.table.dailyDetails")} />{recordCount > 0 && <span className="rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-[10px] font-bold text-[var(--text-muted)]">{t("month.calendar.withRecords", { count: number(recordCount) })}</span>}</div>;
}
