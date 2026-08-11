"use client";

import { Edit3 } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import { MonthBalanceBadge } from "./month-balance-badge";
import { toMonthRecordView } from "./month-table-utils";
import type { MonthTableProps } from "./types";

function Stat({ label, value, dir }: { label: string; value: string; dir?: "ltr" }) {
  return <div className="rounded-xl bg-[var(--surface-1)] px-3 py-2.5"><span className="block text-[9px] text-[var(--text-muted)]">{label}</span><strong dir={dir} className="mt-1 block text-sm font-extrabold text-[var(--text)]">{value}</strong></div>;
}

export function MonthMobileCards({ records, settings, onEdit }: MonthTableProps) {
  const { t, date, digits, duration } = useLocaleUi();
  return (
    <div className="grid gap-3 p-4 md:hidden">
      {records.map((record) => {
        const { item, worked, totalRest, balance } = toMonthRecordView(record, settings);
        return (
          <article key={item.date} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><strong className="block text-sm font-extrabold text-[var(--text)]">{date(item.date, { weekday: "long", day: "numeric", month: "long" })}</strong>{item.note && <p className="mt-1 truncate text-[10px] text-[var(--text-muted)]">{item.note}</p>}</div>
              <Button type="button" variant="outline" size="icon" className="size-10 shrink-0 rounded-xl" onClick={() => onEdit(item.date)} aria-label={t("month.table.editAria", { date: digits(item.date) })}><Edit3 className="size-4" /></Button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Stat label={t("common.clockIn")} value={digits(item.start || "—")} dir="ltr" />
              <Stat label={t("common.clockOut")} value={digits(item.end || "—")} dir="ltr" />
              <Stat label={t("common.worked")} value={duration(worked)} />
              <Stat label={t("month.details.rest")} value={duration(totalRest)} />
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2.5"><span className="text-[10px] font-semibold text-[var(--text-muted)]">{t("month.details.balance")}</span><MonthBalanceBadge balance={balance} compact /></div>
          </article>
        );
      })}
    </div>
  );
}
