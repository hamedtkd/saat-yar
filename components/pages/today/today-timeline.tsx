"use client";

import { Clock3, Edit3, Folder, Info, LockKeyhole, Play, Plus } from "lucide-react";
import { DescriptionTooltip } from "@/components/common/description-tooltip";
import { EmptyState } from "@/components/common/empty-state";
import { PanelHead } from "@/components/common/panel-head";
import { SurfaceCard } from "@/components/common/surface-card";
import { StatusBadge } from "@/components/common/status-badge";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { DateTimePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { useRuntimeNow } from "@/hooks/use-runtime-now";
import { cn } from "@/lib/cn";
import { entryMinutes, localDateKey } from "@/lib/format";
import { resolveRecentProjectTimerAction, updateTimeEntryBoundary } from "@/lib/today-timer-ux";
import type { TimeEntry } from "@/lib/types";
import type { TodayPageProps } from "./types.ts";

export function TodayTimeline(
  props: Pick<
    TodayPageProps,
    | "data"
    | "selectedDate"
    | "editingEntry"
    | "setEditingEntry"
    | "setData"
    | "setToast"
    | "toggleProjectTimer"
    | "activeEntry"
    | "projectTimerSession"
    | "setTab"
  >,
) {
  const { t, duration, time, direction } = useLocaleUi();
  const entries = props.data.timeEntries.filter(
    (entry) => localDateKey(new Date(entry.startedAt)) === props.selectedDate,
  );
  const runtimeNow = useRuntimeNow("minute", entries.some((entry) => !entry.endedAt));
  const now = runtimeNow ?? 0;
  const recentProjects = props.data.projects.filter((item) => item.status === "active").slice(0, 3);
  const activeProjectId = props.projectTimerSession?.projectId ?? props.activeEntry?.projectId;
  const activePhase = props.projectTimerSession?.phase ?? (props.activeEntry ? "running" : undefined);

  const applyBoundary = (entry: TimeEntry, boundary: "start" | "end", value: string) => {
    const result = updateTimeEntryBoundary(entry, boundary, value);
    if (!result.ok) {
      props.setToast(result.reason === "active-end" ? t("today.timeline.activeEndHint") : t("today.timeline.invalidRange"));
      return;
    }
    props.setData((previous) => ({
      ...previous,
      timeEntries: previous.timeEntries.map((item) => item.id === entry.id ? result.entry : item),
    }));
  };

  return (
    <section className="mb-4 grid grid-cols-[minmax(0,1fr)_300px] gap-2.5 max-[900px]:grid-cols-1 max-[359px]:gap-2">
      <SurfaceCard className="dashboard-card min-w-0 p-3 shadow-[0_5px_16px_rgba(0,0,0,.03)] max-[359px]:p-2.5">
        <PanelHead icon={<Clock3 />} title={t("today.timeline.title")}>
          {props.data.settings.mode !== "employee" && (
            <Button variant="ghost" size="sm" onClick={() => props.setEditingEntry(props.editingEntry ? "" : "manual")}>
              <Plus /> {t("today.timeline.addEntry")}
            </Button>
          )}
        </PanelHead>
        <div
          data-today-timeline-scroll
          className={cn(
            "max-h-[360px] w-full overflow-auto overscroll-contain [scrollbar-width:thin] [&_table]:w-full [&_table]:border-collapse [&_table]:text-[11px] [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 [&_th]:h-[39px] [&_th]:whitespace-nowrap [&_th]:border-y [&_th]:border-[var(--border)] [&_th]:bg-[var(--surface-2)] [&_th]:px-3 [&_th]:py-2 [&_th]:font-semibold [&_th]:text-[var(--text-muted)] [&_td]:min-h-[46px] [&_td]:whitespace-nowrap [&_td]:border-b [&_td]:border-[var(--border)] [&_td]:px-3 [&_td]:py-[9px] [&_td]:text-[var(--text)] [&_td_strong]:flex [&_td_strong]:items-center [&_td_strong]:gap-[7px] [&_td_strong]:text-[11px] [&_td_strong]:text-[var(--text)] [&_td_strong>i]:size-[7px] [&_td_strong>i]:rounded-full [&_td_small]:mt-[3px] [&_td_small]:block [&_td_small]:text-[9px] [&_td_small]:text-[var(--text-muted)] [&_td_input]:min-w-[175px] max-[620px]:max-h-[320px] max-[359px]:max-h-[280px] max-[359px]:[&_table]:text-[10px] max-[359px]:[&_th]:px-2 max-[359px]:[&_td]:px-2 max-[359px]:[&_td_input]:min-w-[150px]",
            direction === "rtl" ? "[&_th]:text-right" : "[&_th]:text-left",
          )}
        >
          <table>
            <thead>
              <tr>
                <th>{t("common.task")}</th>
                <th>{t("common.start")}</th>
                <th>{t("common.end")}</th>
                <th>{t("today.timeline.duration")}</th>
                <th>{t("common.billable")}</th>
                <th>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const project = props.data.projects.find((item) => item.id === entry.projectId);
                const editing = props.editingEntry === entry.id;
                return (
                  <tr key={entry.id}>
                    <td>
                      <strong>
                        <i style={{ background: project?.color }} />
                        {entry.task || project?.name || t("common.noTitle")}
                      </strong>
                      <small>{entry.note}</small>
                    </td>
                    <td>
                      {editing ? (
                        <DateTimePicker
                          value={entry.startedAt}
                          mode={props.data.settings.mode}
                          includeOfficialHolidays={props.data.settings.autoOfficialHolidays}
                          includeWeeklyHoliday={props.data.settings.autoWeeklyHoliday}
                          holidayOverrides={props.data.holidayOverrides}
                          weeklySchedule={props.data.settings.weeklySchedule}
                          onChange={(startedAt) => applyBoundary(entry, "start", startedAt)}
                        />
                      ) : time(entry.startedAt)}
                    </td>
                    <td>
                      {editing && entry.endedAt ? (
                        <DateTimePicker
                          value={entry.endedAt}
                          mode={props.data.settings.mode}
                          includeOfficialHolidays={props.data.settings.autoOfficialHolidays}
                          includeWeeklyHoliday={props.data.settings.autoWeeklyHoliday}
                          holidayOverrides={props.data.holidayOverrides}
                          weeklySchedule={props.data.settings.weeklySchedule}
                          onChange={(endedAt) => applyBoundary(entry, "end", endedAt)}
                        />
                      ) : entry.endedAt ? time(entry.endedAt) : (
                        <span className="inline-flex items-center gap-1.5 text-[var(--accent-strong)]">
                          {t("common.running")}
                          {editing && <DescriptionTooltip content={t("today.timeline.activeEndHint")} />}
                        </span>
                      )}
                    </td>
                    <td>{duration(entryMinutes(entry, now))}</td>
                    <td><StatusBadge success={entry.billable}>{entry.billable ? t("common.yes") : t("common.no")}</StatusBadge></td>
                    <td>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => props.setEditingEntry(editing ? "" : entry.id)}
                        aria-label={t("common.edit")}
                      >
                        <Edit3 />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={6}><EmptyState icon={<Clock3 />} title={t("today.timeline.emptyTitle")} description={t("today.timeline.emptyDescription")} /></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center px-0 pb-0 pt-3 text-[11px] text-[var(--text-muted)] [&_strong]:text-base [&_strong]:text-[var(--text)]">
          <span>{t("today.timeline.total")} <strong>{duration(entries.reduce((sum, entry) => sum + entryMinutes(entry, now), 0))}</strong></span>
        </div>
      </SurfaceCard>

      {props.data.settings.mode !== "employee" && (
        <SurfaceCard as="aside" className="dashboard-card p-4 shadow-[0_5px_16px_rgba(0,0,0,.03)] max-[900px]:order-first max-[359px]:p-3 [&>button]:mt-3">
          <PanelHead icon={<Info />} title={t("today.timeline.recentProjects")} />
          <div className="mt-2 grid gap-2">
            {recentProjects.map((project) => {
              const action = resolveRecentProjectTimerAction(project.id, activeProjectId, activePhase);
              const clientName = props.data.clients.find((item) => item.id === project.clientId)?.name;
              return (
                <div
                  className={cn(
                    "min-w-0 rounded-[15px] border border-[var(--dashboard-border)] bg-[color-mix(in_srgb,var(--surface-2)_72%,transparent)] p-3 max-[359px]:rounded-[13px] max-[359px]:p-2.5",
                    (action === "running" || action === "paused") && "border-[color-mix(in_srgb,var(--accent)_28%,var(--dashboard-border))] bg-[color-mix(in_srgb,var(--accent-soft)_55%,var(--surface-2))]",
                  )}
                  key={project.id}
                >
                  <div className="flex min-w-0 items-center gap-2.5 max-[359px]:gap-2">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: project.color }} />
                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-xs text-[var(--text)] max-[359px]:text-[11px]">{project.name}</strong>
                      {clientName && <small className="mt-0.5 block truncate text-[9px] text-[var(--text-muted)]">{clientName}</small>}
                    </div>
                    {action === "start" && (
                      <Button variant="outline" size="sm" className="h-8 shrink-0 whitespace-nowrap px-2.5 max-[359px]:h-7 max-[359px]:px-2 max-[359px]:text-[10px]" onClick={() => props.toggleProjectTimer(project.id)}>
                        <Play /> {t("common.start")}
                      </Button>
                    )}
                  </div>

                  {action !== "start" && (
                    <div className="mt-2 flex min-w-0 items-center justify-between gap-2 ps-5 max-[359px]:mt-1.5 max-[359px]:ps-4">
                      {action === "running" ? (
                        <StatusBadge tone="success" className="max-w-full whitespace-nowrap">{t("today.timer.running")}</StatusBadge>
                      ) : action === "paused" ? (
                        <StatusBadge tone="warning" className="max-w-full whitespace-nowrap">{t("today.timer.paused")}</StatusBadge>
                      ) : (
                        <span className="inline-flex min-w-0 items-center gap-1.5 text-[9px] text-[var(--text-muted)]">
                          <LockKeyhole aria-hidden="true" className="size-3 shrink-0" />
                          <span className="truncate">{t("today.timeline.timerBusy")}</span>
                          <DescriptionTooltip content={t("today.timeline.finishCurrentFirst")} />
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {recentProjects.length === 0 && <EmptyState compact icon={<Folder />} description={t("today.timeline.createFirstProject")} />}
          <Button variant="ghost" className="w-full" onClick={() => props.setTab("projects")}>{t("today.timeline.viewAllProjects")}</Button>
        </SurfaceCard>
      )}
    </section>
  );
}
