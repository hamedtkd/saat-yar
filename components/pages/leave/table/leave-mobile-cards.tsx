import { Umbrella } from "lucide-react";

import { StatusBadge } from "@/components/common/status-badge";
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
    <div className={cn("flex items-center justify-between gap-4", "rounded-xl border border-[#e7efed]", "bg-white px-3 py-3")}>
      <span className="text-[10px] text-[#6c7d89]">{label}</span>
      <strong className="text-xs font-extrabold text-[#102a3a]">{value}</strong>
    </div>
  );
}

export function LeaveMobileCards({ entries, onEdit, onDelete }: LeaveMobileCardsProps) {
  return (
    <div className="grid gap-3 p-4 md:hidden">
      {entries.map((entry) => {
        const sameDate = entry.startDate === entry.endDate;
        return (
          <article key={entry.id} className={cn("rounded-2xl border border-[#e2ebe8]", "bg-[#fbfdfc] p-4")}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm font-extrabold text-[#102a3a]">{getLeaveTypeLabel(entry.type)}</strong>
                  <StatusBadge success>{getLeaveDurationLabel(entry)}</StatusBadge>
                </div>
                <p className="mt-2 text-[10px] leading-6 text-[#6c7d89]">
                  {sameDate ? formatLeaveDate(entry.startDate) : `${formatLeaveDate(entry.startDate)} تا ${formatLeaveDate(entry.endDate)}`}
                </p>
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#edf9f4] text-[#079b60]"><Umbrella className="size-5" /></span>
            </div>
            <div className="mt-4 grid gap-2">
              <DetailRow label="شروع" value={formatLeaveDate(entry.startDate)} />
              {!sameDate && <DetailRow label="پایان" value={formatLeaveDate(entry.endDate)} />}
              <DetailRow label="مدت" value={getLeaveDurationLabel(entry)} />
            </div>
            {entry.note && (
              <div className="mt-3 rounded-xl border border-[#e7efed] bg-white px-3 py-3">
                <span className="block text-[9px] text-[#6c7d89]">توضیح</span>
                <p className="mt-1 text-[11px] leading-6 text-[#2e4856]">{entry.note}</p>
              </div>
            )}
            <LeaveActions entry={entry} onEdit={onEdit} onDelete={onDelete} />
          </article>
        );
      })}
    </div>
  );
}
