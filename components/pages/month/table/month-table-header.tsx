"use client";

import { ArrowDownAZ, ArrowUpAZ, FileSpreadsheet } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MonthTableSort, MonthTableSortKey } from "./types";

type MonthTableHeaderProps = {
  recordCount: number;
  sort: MonthTableSort;
  onSortChange: (sort: MonthTableSort) => void;
};

export function MonthTableHeader({ recordCount, sort, onSortChange }: MonthTableHeaderProps) {
  const { t, number } = useLocaleUi();
  const options: Array<{ value: MonthTableSortKey; label: string }> = [
    { value: "date", label: t("common.date") },
    { value: "clockIn", label: t("common.clockIn") },
    { value: "clockOut", label: t("common.clockOut") },
    { value: "worked", label: t("common.worked") },
    { value: "rest", label: t("common.break") },
    { value: "balance", label: t("common.balance") },
  ];
  const DirectionIcon = sort.direction === "asc" ? ArrowUpAZ : ArrowDownAZ;
  return (
    <div className="grid gap-3 px-4 pt-4 sm:px-5 sm:pt-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
      <PanelHead icon={<FileSpreadsheet />} title={t("month.table.dailyDetails")}>
        {recordCount > 0 && <span className="rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-[10px] font-bold text-[var(--text-muted)]">{t("month.calendar.withRecords", { count: number(recordCount) })}</span>}
      </PanelHead>
      {recordCount > 1 && (
        <div data-month-table-sort className="flex min-w-0 items-center gap-2 rounded-[14px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-1.5 md:hidden">
          <span className="shrink-0 px-1 text-[9px] font-bold text-[var(--text-muted)]">{t("month.table.sortBy")}</span>
          <Select value={sort.key} onValueChange={(value) => onSortChange({ ...sort, key: value as MonthTableSortKey })}>
            <SelectTrigger className="h-9 min-w-0 flex-1 border-0 bg-[var(--surface-1)]"><SelectValue /></SelectTrigger>
            <SelectContent>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
          </Select>
          <Button type="button" variant="outline" size="icon" className="size-9 shrink-0" onClick={() => onSortChange({ ...sort, direction: sort.direction === "asc" ? "desc" : "asc" })} aria-label={t("month.table.toggleSortDirection")}><DirectionIcon className="size-4" /></Button>
        </div>
      )}
    </div>
  );
}
