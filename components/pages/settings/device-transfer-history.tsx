"use client";

import { ArrowDownToLine, ArrowUpFromLine, CheckCircle2, History, Trash2 } from "lucide-react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { Button } from "@/components/ui/button";
import type { DeviceTransferHistoryEntry } from "@/lib/device-transfer-history";

export function DeviceTransferHistory({ entries, onClear }: {
  entries: DeviceTransferHistoryEntry[];
  onClear: () => void;
}) {
  const { date, number, s } = useSystemUi();
  if (entries.length === 0) return null;

  const describeEntry = (entry: DeviceTransferHistoryEntry) => {
    if (entry.direction === "sent") return s("Package receipt was acknowledged by the other device");
    const mode = entry.mode === "replace" ? s("Full replacement") : s("Merge");
    return s("{mode} · {additions} new data · {conflicts} conflicts", {
      mode,
      additions: number(entry.additions ?? 0),
      conflicts: number(entry.conflicts ?? 0),
    });
  };

  return (
    <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4" data-device-transfer-history>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="size-4 text-[var(--accent-strong)]" />
          <strong className="text-xs">{s("Recent transfers")}</strong>
        </div>
        <Button type="button" size="sm" variant="ghost" onClick={onClear}><Trash2 /> {s("Clear history")}</Button>
      </div>
      <div className="grid gap-2">
        {entries.slice(0, 3).map((entry) => {
          const Icon = entry.direction === "sent" ? ArrowUpFromLine : ArrowDownToLine;
          const when = Number.isNaN(new Date(entry.at).getTime())
            ? s("Unknown time")
            : date(entry.at, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
          return (
            <div key={entry.id} className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2.5">
              <span className="mt-0.5 rounded-lg bg-[var(--accent-soft)] p-1.5 text-[var(--accent-strong)]"><Icon className="size-3.5" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-[10px]">{entry.direction === "sent" ? s("Sent to {device}", { device: entry.deviceName }) : s("Received from {device}", { device: entry.deviceName })}</strong>
                  <span className="text-[9px] text-[var(--text-muted)]">{when}</span>
                </div>
                <p className="mt-1 text-[9px] leading-5 text-[var(--text-muted)]"><CheckCircle2 className="me-1 inline size-3 text-[var(--accent-strong)]" />{describeEntry(entry)}</p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[9px] leading-5 text-[var(--text-muted)]">{s("This history stores only transfer metadata on this device; data content and session keys are never stored in it.")}</p>
    </div>
  );
}
