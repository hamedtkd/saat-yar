"use client";

import { Clock3, Play } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge } from "@/components/common/status-badge";
import { SurfaceCard } from "@/components/common/surface-card";
import { useBusinessUi } from "@/components/i18n/use-business-ui";
import { Button } from "@/components/ui/button";
import type { TimeEntry } from "@/lib/types";

export function TimeEntriesPanel({ entries, now, onStart }: { entries: TimeEntry[]; now: number; onStart: () => void }) {
  const { b, date, duration, time } = useBusinessUi();
  return (
    <SurfaceCard as="article" className="min-w-0 p-[13px]">
      <PanelHead icon={<Clock3 />} title={b("projects.time.title")} />
      <div className="w-full overflow-x-auto"><table className="w-full border-collapse text-[11px]"><thead><tr className="border-y border-[var(--border)] bg-[var(--surface-2)] text-start text-[var(--text-muted)]"><th className="p-3">{b("common.date")}</th><th className="p-3">{b("projects.time.start")}</th><th className="p-3">{b("projects.time.end")}</th><th className="p-3">{b("common.duration")}</th><th className="p-3">{b("projects.time.task")}</th><th className="p-3">{b("projects.time.billable")}</th></tr></thead><tbody>
        {entries.slice(0, 8).map((entry) => {
          const startedAt = new Date(entry.startedAt);
          const endTime = entry.endedAt ? new Date(entry.endedAt).getTime() : now;
          const minutes = Math.max(0, Math.round((endTime - startedAt.getTime()) / 60_000));
          return <tr key={entry.id} className="border-b border-[var(--border)]"><td className="p-3">{date(startedAt, { weekday: "long", day: "numeric", month: "long" })}</td><td className="p-3">{time(startedAt)}</td><td className="p-3">{entry.endedAt ? time(new Date(entry.endedAt)) : b("projects.time.running")}</td><td className="p-3">{duration(minutes)}</td><td className="p-3">{entry.task || entry.note || "—"}</td><td className="p-3"><StatusBadge success={entry.billable}>{entry.billable ? b("common.yes") : b("common.no")}</StatusBadge></td></tr>;
        })}
        {entries.length === 0 && <tr><td colSpan={6}><EmptyState compact icon={<Clock3 />} title={b("projects.time.emptyTitle")} description={b("projects.time.emptyDescription")}><Button size="sm" variant="outline" onClick={onStart}><Play /> {b("projects.detail.timerStart")}</Button></EmptyState></td></tr>}
      </tbody></table></div>
    </SurfaceCard>
  );
}
