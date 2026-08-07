import { Clock3, Play } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge } from "@/components/common/status-badge";
import { SurfaceCard } from "@/components/common/surface-card";
import { Button } from "@/components/ui/button";
import { duration } from "@/lib/format";
import type { TimeEntry } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { weekday: "long", day: "numeric", month: "long" });
const timeFormatter = new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" });

export function TimeEntriesPanel({ entries, now, onStart }: { entries: TimeEntry[]; now: number; onStart: () => void }) {
  return (
    <SurfaceCard as="article" className="min-w-0 p-[13px]">
      <PanelHead icon={<Clock3 />} title="تازه‌ترین رکوردهای زمان" />
      <div className="w-full overflow-x-auto"><table className="w-full border-collapse text-[11px]"><thead><tr className="border-y border-[var(--border)] bg-[var(--surface-2)] text-right text-[var(--text-muted)]"><th className="p-3">تاریخ</th><th className="p-3">شروع</th><th className="p-3">پایان</th><th className="p-3">مدت</th><th className="p-3">وظیفه</th><th className="p-3">قابل صورتحساب</th></tr></thead><tbody>
        {entries.slice(0, 8).map((entry) => {
          const startedAt = new Date(entry.startedAt);
          const endTime = entry.endedAt ? new Date(entry.endedAt).getTime() : now;
          const minutes = Math.max(0, Math.round((endTime - startedAt.getTime()) / 60_000));
          return <tr key={entry.id} className="border-b border-[var(--border)]"><td className="p-3">{dateFormatter.format(startedAt)}</td><td className="p-3">{timeFormatter.format(startedAt)}</td><td className="p-3">{entry.endedAt ? timeFormatter.format(new Date(entry.endedAt)) : "در حال اجرا"}</td><td className="p-3">{duration(minutes)}</td><td className="p-3">{entry.task || entry.note || "—"}</td><td className="p-3"><StatusBadge success={entry.billable}>{entry.billable ? "بله" : "خیر"}</StatusBadge></td></tr>;
        })}
        {entries.length === 0 && <tr><td colSpan={6}><EmptyState compact icon={<Clock3 />} title="هنوز زمانی ثبت نشده" description="تایمر همین پروژه را مستقیم از اینجا شروع کن."><Button size="sm" variant="outline" onClick={onStart}><Play /> شروع تایمر</Button></EmptyState></td></tr>}
      </tbody></table></div>
    </SurfaceCard>
  );
}
