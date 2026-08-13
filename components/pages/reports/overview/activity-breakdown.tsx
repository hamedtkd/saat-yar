"use client";

import { BookOpen, Brain, BriefcaseBusiness, FolderKanban, Shapes, Users } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { activityKinds, getActivityBreakdown } from "@/lib/activity-segments";
import type { ActivityKind, WorkRecord } from "@/lib/types";
import type { MessageKey } from "@/lib/i18n/fa";

const labels: Record<ActivityKind, MessageKey> = {
  "deep-work": "activity.kind.deepWork",
  meeting: "activity.kind.meeting",
  learning: "activity.kind.learning",
  admin: "activity.kind.admin",
  project: "activity.kind.project",
  other: "activity.kind.other",
};
const icons = { "deep-work": Brain, meeting: Users, learning: BookOpen, admin: BriefcaseBusiness, project: FolderKanban, other: Shapes } as const;

export function ActivityBreakdown({ records }: { records: WorkRecord[] }) {
  const { duration, percent, t } = useLocaleUi();
  const breakdown = getActivityBreakdown(records);
  if (!breakdown.totalMinutes) return <div data-activity-breakdown className="rounded-[var(--card-radius)] border border-dashed border-[var(--dashboard-border)] bg-[var(--surface-2)] px-4 py-5 text-center text-[11px] leading-6 text-[var(--text-muted)]">{t("reports.activity.empty")}</div>;

  return <div data-activity-breakdown className="grid grid-cols-3 gap-3 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">{activityKinds.map((kind) => {
    const Icon = icons[kind];
    const minutes = breakdown.totals[kind];
    const share = breakdown.totalMinutes ? Math.round(minutes / breakdown.totalMinutes * 100) : 0;
    return <article key={kind} className="rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-1)] p-4"><div className="flex items-start justify-between gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><Icon className="size-4" /></span><strong className="text-sm text-[var(--text)]">{duration(minutes)}</strong></div><div className="mt-3 flex items-center justify-between gap-2 text-[10px]"><span className="font-bold text-[var(--text-muted)]">{t(labels[kind])}</span><span className="font-black text-[var(--accent-strong)]">{percent(share)}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]"><div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${share}%` }} /></div></article>;
  })}</div>;
}
