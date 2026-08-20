"use client";

import { BookOpen, Brain, BriefcaseBusiness, FolderKanban, LayoutGrid, Play, Shapes, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { SurfaceCard } from "@/components/common/surface-card";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { activityKinds, getActivityBreakdown, getRecentActivityTitleSuggestions } from "@/lib/activity-segments";
import { resolveActivityProjectName } from "@/lib/activity-project-context";
import type { MessageKey } from "@/lib/i18n/fa";
import type { ActivityKind, ActivityProjectContext, ActivitySegment, BreakItem, Mode, Project, WorkProject, WorkRecord } from "@/lib/types";
import { ActivityLivePanel } from "./activity-live-panel";
import { ActivityProjectField } from "./activity-project-field";
import { ActivitySegmentRow } from "./activity-segment-row";
import { ActivityTitleField } from "./activity-title-field";

const labelKeys: Record<ActivityKind, MessageKey> = {
  "deep-work": "activity.kind.deepWork",
  meeting: "activity.kind.meeting",
  learning: "activity.kind.learning",
  admin: "activity.kind.admin",
  project: "activity.kind.project",
  other: "activity.kind.other",
};
const icons = { "deep-work": Brain, meeting: Users, learning: BookOpen, admin: BriefcaseBusiness, project: FolderKanban, other: Shapes } as const;

export function ActivitySegmentsCard({ record, records, mode, workProjects, freelanceProjects, activeSegment, activeBreak, lunchRunning, trackingAllowed, onCreateWorkProject, onStart, onStop, onUpdateDuration, onDelete }: {
  record: WorkRecord;
  records: WorkRecord[];
  mode: Mode;
  workProjects: WorkProject[];
  freelanceProjects: Project[];
  activeSegment?: ActivitySegment;
  activeBreak?: BreakItem;
  lunchRunning: boolean;
  trackingAllowed: boolean;
  onCreateWorkProject: (name: string) => string | undefined;
  onStart: (kind: ActivityKind, projectContext?: ActivityProjectContext, title?: string) => void;
  onStop: () => void;
  onUpdateDuration: (segmentId: string, minutes: number) => void;
  onDelete: (segmentId: string) => void;
}) {
  const { duration, t } = useLocaleUi();
  const [kind, setKind] = useState<ActivityKind>("deep-work");
  const [projectContext, setProjectContext] = useState<ActivityProjectContext>();
  const [title, setTitle] = useState("");
  const titleSuggestions = useMemo(() => getRecentActivityTitleSuggestions(records), [records]);
  const breakdown = getActivityBreakdown([record]);
  const canTrack = Boolean(trackingAllowed && record.start && !record.end && !activeBreak && !lunchRunning);
  const recent = [...record.activitySegments].reverse().filter((segment) => Boolean(segment.end));
  const activeProjectName = activeSegment ? resolveActivityProjectName(activeSegment, mode, workProjects, freelanceProjects) : undefined;

  return (
    <SurfaceCard as="section" data-activity-segments className="dashboard-card mb-4 overflow-visible p-3 shadow-[0_5px_16px_rgba(0,0,0,.03)] min-[360px]:p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <strong className="text-sm font-black text-[var(--text)]">{t("activity.today.title")}</strong>
          <span className="max-w-[760px] text-[10px] leading-5 text-[var(--text-muted)]">{t("activity.today.description")}</span>
        </div>
        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[10px] font-black text-[var(--accent-strong)]">{t("activity.today.total", { duration: duration(breakdown.totalMinutes) })}</span>
      </div>

      {activeSegment ? (
        <ActivityLivePanel
          segment={activeSegment}
          projectName={activeProjectName}
          onStop={onStop}
        />
      ) : (
        <div className="mt-4 rounded-[18px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-3 min-[360px]:p-4">
          <div className="grid gap-3 md:grid-cols-[minmax(140px,.75fr)_minmax(220px,1.25fr)_minmax(190px,1fr)_auto] md:items-end">
            <label className="grid min-w-0 content-start gap-1.5">
              <span className="flex min-h-5 items-center text-[11px] font-black text-[var(--text)]">{t("activity.today.type")}</span>
              <Select value={kind} onValueChange={(value) => setKind(value as ActivityKind)}>
                <SelectTrigger data-activity-kind><SelectValue /></SelectTrigger>
                <SelectContent>{activityKinds.map((item) => <SelectItem key={item} value={item}>{t(labelKeys[item])}</SelectItem>)}</SelectContent>
              </Select>
            </label>
            <ActivityTitleField value={title} suggestions={titleSuggestions} label={t("activity.today.workItem")} optionalLabel={t("common.optional")} placeholder={t("activity.today.workItemPlaceholder")} recentLabel={t("activity.today.recentTitles")} onChange={setTitle} />
            <ActivityProjectField mode={mode} value={projectContext} workProjects={workProjects} freelanceProjects={freelanceProjects} onChange={setProjectContext} onCreateWorkProject={onCreateWorkProject} />
            <Button data-start-activity-segment className="h-11 w-full md:w-auto" disabled={!canTrack} onClick={() => onStart(kind, projectContext, title)}><Play className="size-4" />{t("activity.today.start")}</Button>
          </div>
          {!canTrack && <p className="mt-2 text-[10px] text-[var(--text-muted)]">{!record.start || record.end ? t("activity.today.startDayHint") : t("activity.today.pauseHint")}</p>}
        </div>
      )}

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.15fr]">
        <div className="rounded-[16px] border border-[var(--dashboard-border)] bg-[color-mix(in_srgb,var(--surface-2)_82%,transparent)] p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <strong className="text-[11px] text-[var(--text)]">{t("activity.today.categories")}</strong>
            <LayoutGrid aria-hidden="true" className="size-4 text-[var(--accent-strong)]" />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {activityKinds.map((item) => {
              const Icon = icons[item];
              return (
                <div key={item} className="grid min-h-[86px] content-between rounded-[14px] border border-[var(--dashboard-border)] bg-[var(--surface-1)] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="grid size-8 place-items-center rounded-lg bg-[var(--surface-2)] text-[var(--accent-strong)]"><Icon aria-hidden="true" className="size-4" /></span>
                    <strong className="text-[11px] tabular-nums text-[var(--text)]">{duration(breakdown.totals[item])}</strong>
                  </div>
                  <small className="mt-2 block text-[9px] font-bold text-[var(--text-muted)]">{t(labelKeys[item])}</small>
                </div>
              );
            })}
          </div>
        </div>
        <div className="min-h-0 rounded-[16px] border border-[var(--dashboard-border)] bg-[color-mix(in_srgb,var(--surface-2)_82%,transparent)] p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <strong className="text-[11px] text-[var(--text)]">{t("activity.today.recent")}</strong>
            {recent.length > 0 && <span className="text-[9px] font-bold text-[var(--text-muted)]">{recent.length}</span>}
          </div>
          {recent.length ? <div data-activity-recent-scroll className="mt-3 grid max-h-[198px] gap-2 overflow-y-auto overscroll-contain pe-1 [scrollbar-width:thin] sm:max-h-[202px]">{recent.map((segment) => <ActivitySegmentRow key={segment.id} segment={segment} mode={mode} workProjects={workProjects} freelanceProjects={freelanceProjects} onUpdateDuration={onUpdateDuration} onDelete={onDelete} />)}</div> : <p className="mt-2 text-[10px] leading-5 text-[var(--text-muted)]">{t("activity.today.empty")}</p>}
        </div>
      </div>
    </SurfaceCard>
  );
}
