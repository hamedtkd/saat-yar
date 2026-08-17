"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown, Edit3 } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { MonthBalanceBadge } from "./month-balance-badge";
import { toMonthRecordView } from "./month-table-utils";
import type { MonthTableSortKey, SortedMonthTableProps } from "./types";

function SortHeading({ label, sortKey, sort, onSortChange, sticky = false }: {
  label: string;
  sortKey: MonthTableSortKey;
  sort: SortedMonthTableProps["sort"];
  onSortChange: SortedMonthTableProps["onSortChange"];
  sticky?: boolean;
}) {
  const active = sort.key === sortKey;
  const Icon = active ? (sort.direction === "asc" ? ArrowUp : ArrowDown) : ChevronsUpDown;
  const nextDirection = active && sort.direction === "asc" ? "desc" : "asc";
  return (
    <th
      aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
      className={cn(
        "h-11 whitespace-nowrap border-y border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-1 text-start font-semibold text-[var(--text-muted)]",
        sticky && "sticky start-0 z-20 border-e bg-[var(--surface-2)]",
      )}
    >
      <button type="button" className="flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-start transition-colors hover:bg-[var(--surface-1)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]" onClick={() => onSortChange({ key: sortKey, direction: nextDirection })}>
        <span>{label}</span><Icon aria-hidden="true" className={cn("size-3.5", active && "text-[var(--accent-strong)]")} />
      </button>
    </th>
  );
}

export function MonthDesktopTable({ records, settings, onEdit, sort, onSortChange }: SortedMonthTableProps) {
  const { t, date, digits, duration, direction } = useLocaleUi();
  return (
    <div className="hidden w-full overflow-x-auto px-4 pb-4 pt-3 md:block sm:px-5 sm:pb-5">
      <table className="w-full min-w-[900px] border-separate border-spacing-0 text-[11px]">
        <thead className="sticky top-0 z-10">
          <tr>
            <SortHeading label={t("common.date")} sortKey="date" sort={sort} onSortChange={onSortChange} sticky />
            <SortHeading label={t("common.clockIn")} sortKey="clockIn" sort={sort} onSortChange={onSortChange} />
            <SortHeading label={t("common.clockOut")} sortKey="clockOut" sort={sort} onSortChange={onSortChange} />
            <SortHeading label={t("common.worked")} sortKey="worked" sort={sort} onSortChange={onSortChange} />
            <SortHeading label={t("common.break")} sortKey="rest" sort={sort} onSortChange={onSortChange} />
            <SortHeading label={t("common.balance")} sortKey="balance" sort={sort} onSortChange={onSortChange} />
            <th className={cn("h-11 whitespace-nowrap border-y border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 font-semibold text-[var(--text-muted)]", direction === "rtl" ? "text-right" : "text-left")}>{t("common.note")}</th>
            <th className={cn("h-11 whitespace-nowrap border-y border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 font-semibold text-[var(--text-muted)]", direction === "rtl" ? "text-right" : "text-left")}>{t("common.edit")}</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => {
            const { item, worked, totalRest, balance } = toMonthRecordView(record, settings);
            return (
              <tr key={item.date} className="group transition-colors hover:bg-[var(--surface-2)]">
                <td className="sticky start-0 z-[2] border-b border-e border-[var(--border)] bg-[var(--surface-1)] px-3 py-3 group-hover:bg-[var(--surface-2)]"><div className="grid gap-1"><strong className="text-[11px] text-[var(--text)]">{date(item.date, { weekday: "long", day: "numeric", month: "long" })}</strong>{item.holiday && <span className="text-[9px] font-semibold text-[var(--danger)]">{t("common.holiday")}</span>}</div></td>
                <td dir="ltr" className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 font-semibold tabular-nums text-[var(--text)]">{digits(item.start || "—")}</td>
                <td dir="ltr" className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 font-semibold tabular-nums text-[var(--text)]">{digits(item.end || "—")}</td>
                <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3"><strong className="font-extrabold tabular-nums text-[var(--text)]">{duration(worked)}</strong></td>
                <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 text-[var(--text)]"><div className="grid gap-1"><span className="tabular-nums">{duration(totalRest)}</span><small className="text-[9px] text-[var(--text-muted)]">{t("month.details.rest")}</small></div></td>
                <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3"><MonthBalanceBadge balance={balance} /></td>
                <td className="max-w-[260px] border-b border-[var(--border)] px-3 py-3 text-[var(--text)]"><span className="block truncate" title={item.note || undefined}>{item.note || "—"}</span></td>
                <td className="border-b border-[var(--border)] px-3 py-3"><Button type="button" variant="outline" size="icon" className="size-9 rounded-xl" onClick={() => onEdit(item.date)} aria-label={t("month.table.editAria", { date: digits(item.date) })}><Edit3 className="size-4" /></Button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
