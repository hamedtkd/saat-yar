"use client";

import { Umbrella } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { useBusinessUi } from "@/components/i18n/use-business-ui";
import { cn } from "@/lib/cn";
import type { LeaveEntry } from "@/lib/types";
import { LeaveActions } from "./leave-actions";
import { formatLeaveDate, getLeaveDurationLabel, getLeaveTypeLabel } from "./leave-table-utils";

type LeaveMobileCardsProps = {
  entries: LeaveEntry[];
  onEdit: (entry: LeaveEntry) => void;
  onDelete: (entry: LeaveEntry) => void;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-4", "rounded-xl border border-[var(--border)]", "bg-[var(--surface-1)] px-3 py-3")}>
      <span className="text-[10px] text-[var(--text-muted)]">{label}</span>
      <strong className="text-xs font-extrabold text-[var(--text)]">{value}</strong>
    </div>
  );
}

export function LeaveMobileCards({ entries, onEdit, onDelete }: LeaveMobileCardsProps) {
  const { b, calendar, locale } = useBusinessUi();
  return (
    <div className="grid gap-3 p-4 md:hidden">
      {entries.map((entry) => {
        const sameDate = entry.startDate === entry.endDate;
        const range = b("leave.table.rangeValue", { start: formatLeaveDate(entry.startDate, locale, calendar), end: formatLeaveDate(entry.endDate, locale, calendar) });
        return (
          <article key={entry.id} className={cn("rounded-2xl border border-[var(--border)]", "bg-[var(--surface-2)] p-4")}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm font-extrabold text-[var(--text)]">{getLeaveTypeLabel(entry.type, locale)}</strong>
                  <StatusBadge success>{getLeaveDurationLabel(entry, locale)}</StatusBadge>
                </div>
                <p className="mt-2 text-[10px] leading-6 text-[var(--text-muted)]">{sameDate ? formatLeaveDate(entry.startDate, locale, calendar) : range}</p>
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><Umbrella className="size-5" /></span>
            </div>
            <div className="mt-4 grid gap-2">
              <DetailRow label={b("common.start")} value={formatLeaveDate(entry.startDate, locale, calendar)} />
              {!sameDate && <DetailRow label={b("common.end")} value={formatLeaveDate(entry.endDate, locale, calendar)} />}
              <DetailRow label={b("common.duration")} value={getLeaveDurationLabel(entry, locale)} />
            </div>
            {entry.note && (
              <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 py-3">
                <span className="block text-[9px] text-[var(--text-muted)]">{b("common.description")}</span>
                <p className="mt-1 text-[11px] leading-6 text-[var(--text)]">{entry.note}</p>
              </div>
            )}
            <LeaveActions entry={entry} onEdit={onEdit} onDelete={onDelete} />
          </article>
        );
      })}
    </div>
  );
}
