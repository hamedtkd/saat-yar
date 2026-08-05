import { StatusBadge } from "@/components/common/status-badge";
import { cn } from "@/lib/cn";
import type { LeaveEntry } from "@/lib/types";

import { LeaveActions } from "./leave-actions";
import { formatLeaveDate, getLeaveDurationLabel, getLeaveTypeLabel } from "./leave-table-utils";

type LeaveDesktopTableProps = {
  entries: LeaveEntry[];
  onEdit: (entry: LeaveEntry) => void;
  onDelete: (entry: LeaveEntry) => void;
};

const headings = ["بازه مرخصی", "نوع", "مدت", "توضیح", "عملیات"];

export function LeaveDesktopTable({ entries, onEdit, onDelete }: LeaveDesktopTableProps) {
  return (
    <div className="hidden w-full overflow-x-auto px-4 pb-4 pt-3 md:block sm:px-5 sm:pb-5">
      <table className="w-full min-w-[820px] border-collapse text-[11px]">
        <thead>
          <tr>
            {headings.map((heading) => (
              <th key={heading} className={cn("h-11 whitespace-nowrap", "border-y border-[var(--border)]", "bg-[var(--surface-2)] px-3 py-2", "text-right font-semibold text-[var(--text-muted)]")}>{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const sameDate = entry.startDate === entry.endDate;
            return (
              <tr key={entry.id} className="transition-colors hover:bg-[var(--surface-2)]">
                <td className="border-b border-[var(--border)] px-3 py-3">
                  <div className="grid gap-1">
                    <strong className="text-[11px] text-[var(--text)]">
                      {sameDate ? formatLeaveDate(entry.startDate) : `${formatLeaveDate(entry.startDate)} تا ${formatLeaveDate(entry.endDate)}`}
                    </strong>
                    {!sameDate && <small className="text-[9px] text-[var(--text-muted)]">مرخصی چندروزه</small>}
                  </div>
                </td>
                <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3"><StatusBadge success>{getLeaveTypeLabel(entry.type)}</StatusBadge></td>
                <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3"><strong className="font-extrabold text-[var(--text)]">{getLeaveDurationLabel(entry)}</strong></td>
                <td className="max-w-[280px] border-b border-[var(--border)] px-3 py-3 text-[var(--text)]"><span className="block truncate" title={entry.note || undefined}>{entry.note || "—"}</span></td>
                <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3"><LeaveActions entry={entry} compact onEdit={onEdit} onDelete={onDelete} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
