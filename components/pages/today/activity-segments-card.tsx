"use client";

import { BookOpen, Brain, BriefcaseBusiness, FolderKanban, Play, Shapes, Square, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { LiveDuration } from "@/components/common/live-duration";
import { SurfaceCard } from "@/components/common/surface-card";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { activityKinds, activitySegmentMinutes, getActivityBreakdown } from "@/lib/activity-segments";
import type { ActivityKind, ActivitySegment, BreakItem, Project, WorkRecord } from "@/lib/types";
import type { MessageKey } from "@/lib/i18n/fa";

const labelKeys: Record<ActivityKind, MessageKey> = {
  "deep-work": "activity.kind.deepWork",
  meeting: "activity.kind.meeting",
  learning: "activity.kind.learning",
  admin: "activity.kind.admin",
  project: "activity.kind.project",
  other: "activity.kind.other",
};
const icons = {
  "deep-work": Brain,
  meeting: Users,
  learning: BookOpen,
  admin: BriefcaseBusiness,
  project: FolderKanban,
  other: Shapes,
} as const;

export function ActivitySegmentsCard({ record, projects, activeSegment, activeBreak, lunchRunning, trackingAllowed, onStart, onStop }: {
  record: WorkRecord;
  projects: Project[];
  activeSegment?: ActivitySegment;
  activeBreak?: BreakItem;
  lunchRunning: boolean;
  trackingAllowed: boolean;
  onStart: (kind: ActivityKind, projectId?: string) => void;
  onStop: () => void;
}) {
  const { duration, t } = useLocaleUi();
  const [kind, setKind] = useState<ActivityKind>("deep-work");
  const activeProjects = useMemo(() => projects.filter((project) => project.status === "active"), [projects]);
  const [projectId, setProjectId] = useState("");
  const selectedProjectId = projectId || activeProjects[0]?.id || "";
  const breakdown = getActivityBreakdown([record]);
  const canTrack = Boolean(trackingAllowed && record.start && !record.end && !activeBreak && !lunchRunning);
  const recent = [...record.activitySegments].reverse().slice(0, 4);
  const activeProject = activeSegment?.projectId ? projects.find((project) => project.id === activeSegment.projectId) : undefined;

  return (
    <SurfaceCard as="section" data-activity-segments className="dashboard-card mb-4 overflow-hidden p-4 shadow-[0_5px_16px_rgba(0,0,0,.03)] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1"><strong className="text-sm font-black text-[var(--text)]">{t("activity.today.title")}</strong><span className="text-[10px] leading-5 text-[var(--text-muted)]">{t("activity.today.description")}</span></div>
        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[10px] font-black text-[var(--accent-strong)]">{t("activity.today.total", { duration: duration(breakdown.totalMinutes) })}</span>
      </div>

      {activeSegment && (
        <div data-active-activity-segment className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-[color-mix(in_srgb,var(--success)_26%,var(--border))] bg-[var(--success-soft)] px-4 py-3">
          <div className="flex items-center gap-3"><span className="size-2.5 rounded-full bg-[var(--success)] motion-safe:animate-pulse" /><div className="grid gap-0.5"><strong className="text-xs text-[var(--text)]">{t(labelKeys[activeSegment.kind])}{activeProject ? ` · ${activeProject.name}` : ""}</strong><small className="text-[10px] text-[var(--text-muted)]">{t("activity.today.running")}</small></div></div>
          <div className="flex items-center gap-3"><strong className="font-mono text-sm text-[var(--text)]">{activeSegment.startedAt ? <LiveDuration startedAt={activeSegment.startedAt} /> : duration(activitySegmentMinutes(activeSegment))}</strong><Button size="sm" variant="outline" onClick={onStop}><Square className="size-3.5" />{t("activity.today.stop")}</Button></div>
        </div>
      )}

      {!activeSegment && (
        <div className="mt-4 grid gap-3 rounded-[16px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
          <label className="grid gap-1.5 text-[10px] font-bold text-[var(--text-muted)]"><span>{t("activity.today.type")}</span><Select value={kind} onValueChange={(value) => setKind(value as ActivityKind)}><SelectTrigger data-activity-kind><SelectValue /></SelectTrigger><SelectContent>{activityKinds.map((item) => <SelectItem key={item} value={item}>{t(labelKeys[item])}</SelectItem>)}</SelectContent></Select></label>
          {kind === "project" ? <label className="grid gap-1.5 text-[10px] font-bold text-[var(--text-muted)]"><span>{t("activity.today.project")}</span><Select value={selectedProjectId} onValueChange={setProjectId} disabled={!activeProjects.length}><SelectTrigger data-activity-project><SelectValue placeholder={t("activity.today.noProject")} /></SelectTrigger><SelectContent>{activeProjects.map((project) => <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>)}</SelectContent></Select></label> : <div className="hidden sm:block" />}
          <Button data-start-activity-segment disabled={!canTrack || (kind === "project" && !selectedProjectId)} onClick={() => onStart(kind, kind === "project" ? selectedProjectId : undefined)}><Play className="size-4" />{t("activity.today.start")}</Button>
        </div>
      )}

      {!canTrack && !activeSegment && <p className="mt-2 text-[10px] text-[var(--text-muted)]">{!record.start || record.end ? t("activity.today.startDayHint") : t("activity.today.pauseHint")}</p>}

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.15fr]">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{activityKinds.map((item) => { const Icon = icons[item]; return <div key={item} className="rounded-[14px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-3"><div className="flex items-center justify-between gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[var(--surface-1)] text-[var(--accent-strong)]"><Icon className="size-4" /></span><strong className="text-xs text-[var(--text)]">{duration(breakdown.totals[item])}</strong></div><small className="mt-2 block text-[9px] font-bold text-[var(--text-muted)]">{t(labelKeys[item])}</small></div>; })}</div>
        <div className="rounded-[14px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-3"><strong className="text-[11px] text-[var(--text)]">{t("activity.today.recent")}</strong>{recent.length ? <div className="mt-2 grid gap-1.5">{recent.map((segment) => { const project = segment.projectId ? projects.find((item) => item.id === segment.projectId) : undefined; return <div key={segment.id} className="flex items-center justify-between gap-3 rounded-lg bg-[var(--surface-1)] px-3 py-2 text-[10px]"><span className="min-w-0 truncate text-[var(--text-muted)]">{t(labelKeys[segment.kind])}{project ? ` · ${project.name}` : ""}</span><strong className="shrink-0 text-[var(--text)]">{duration(activitySegmentMinutes(segment))}</strong></div>; })}</div> : <p className="mt-2 text-[10px] leading-5 text-[var(--text-muted)]">{t("activity.today.empty")}</p>}</div>
      </div>
    </SurfaceCard>
  );
}
