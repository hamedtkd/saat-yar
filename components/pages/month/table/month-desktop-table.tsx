"use client";

import { Edit3 } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { MonthBalanceBadge } from "./month-balance-badge";
import { toMonthRecordView } from "./month-table-utils";
import type { MonthTableProps } from "./types";

export function MonthDesktopTable({ records, settings, onEdit }: MonthTableProps) {
  const { t, date, digits, duration, direction } = useLocaleUi();
  const headings = [t("common.date"), t("common.clockIn"), t("common.clockOut"), t("common.worked"), t("common.break"), t("common.balance"), t("common.note"), t("common.edit")];
  return (
    <div className="hidden w-full overflow-x-auto px-4 pb-4 pt-3 md:block sm:px-5 sm:pb-5">
      <table className="w-full min-w-[920px] border-collapse text-[11px]">
        <thead><tr>{headings.map((heading) => <th key={heading} className={cn("h-11 whitespace-nowrap border-y border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 font-semibold text-[var(--text-muted)]", direction === "rtl" ? "text-right" : "text-left")}>{heading}</th>)}</tr></thead>
        <tbody>
          {records.map((record) => {
            const { item, worked, totalRest, balance } = toMonthRecordView(record, settings);
            return (
              <tr key={item.date} className="transition-colors hover:bg-[var(--surface-2)]">
                <td className="border-b border-[var(--border)] px-3 py-3"><div className="grid gap-1"><strong className="text-[11px] text-[var(--text)]">{date(item.date, { weekday: "long", day: "numeric", month: "long" })}</strong>{item.holiday && <span className="text-[9px] font-semibold text-[var(--danger)]">{t("common.holiday")}</span>}</div></td>
                <td dir="ltr" className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 text-[var(--text)]">{digits(item.start || "—")}</td>
                <td dir="ltr" className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 text-[var(--text)]">{digits(item.end || "—")}</td>
                <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3"><strong className="font-extrabold text-[var(--text)]">{duration(worked)}</strong></td>
                <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 text-[var(--text)]"><div className="grid gap-1"><span>{duration(totalRest)}</span><small className="text-[9px] text-[var(--text-muted)]">{t("month.details.rest")}</small></div></td>
                <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3"><MonthBalanceBadge balance={balance} /></td>
                <td className="max-w-[260px] border-b border-[var(--border)] px-3 py-3 text-[var(--text)]"><span className="block truncate" title={item.note || undefined}>{item.note || "—"}</span></td>
                <td className="border-b border-[var(--border)] px-3 py-3"><Button type="button" variant="outline" size="icon" className="size-10 rounded-xl" onClick={() => onEdit(item.date)} aria-label={t("month.table.editAria", { date: digits(item.date) })}><Edit3 className="size-4" /></Button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
