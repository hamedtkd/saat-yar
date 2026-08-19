"use client";

import { Check, CheckCircle2, Hourglass, Play, Square } from "lucide-react";
import { LiveDuration } from "@/components/common/live-duration";
import { LiveWorkDuration } from "@/components/common/live-work-duration";
import { SurfaceCard } from "@/components/common/surface-card";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLiveWorkCalc } from "@/hooks/use-live-work-calc";
import { cn } from "@/lib/cn";
import type { TodayPageProps } from "./types.ts";
import { TodayProgressArc } from "./today-progress-arc";
import { TimerRelationFields } from "./timer-relation-fields";
import { ProjectTimerHero } from "./project-timer/project-timer-hero";
import { ProjectActivityDetails } from "./project-timer/project-activity-details";
import { ProjectTodaySummary } from "./project-timer/project-today-summary";

type Props = Pick<TodayPageProps, "data" | "record" | "selectedDate" | "timerDraft" | "setTimerDraft" | "activeEntry" | "projectTimerSession" | "todayCalc" | "dailyTarget" | "suggestedExit" | "toggleProjectTimer" | "startProjectTimer" | "pauseProjectTimer" | "resumeProjectTimer" | "finishProjectTimer" | "updateProjectTimerDetails" | "startWork" | "finishWork" | "updateRecord" | "createClient" | "createProject"> & {
  scheduledDayOff: boolean;
};

export function TodayFocusCard(props: Props) {
  const { digits, duration, percent, t } = useLocaleUi();
  const mode = props.data.settings.mode;
  const isEmployee = mode === "employee";
  const isFreelancer = mode === "freelancer";
  const flexible = props.data.settings.workTimingMode === "flexible";
  const liveResult = useLiveWorkCalc(props.record, props.dailyTarget, props.todayCalc);
  const hasTarget = props.dailyTarget > 0;
  const progress = hasTarget ? Math.min(100, Math.round(liveResult.credited / props.dailyTarget * 100)) : 0;
  const activeNow = isFreelancer ? Boolean(props.activeEntry) : Boolean(props.activeEntry || (props.record.start && !props.record.end));
  const timerLabel = props.activeEntry
    ? t("today.focus.projectRunning")
    : isFreelancer
      ? t("today.focus.freelancerReady")
      : props.record.start && !props.record.end
        ? t("today.focus.working")
        : props.record.end
          ? t("today.focus.dayRecorded")
          : props.scheduledDayOff
            ? t("today.focus.scheduledOff")
            : t("today.focus.ready");
  const timerValue = props.activeEntry
    ? <LiveDuration startedAt={props.activeEntry.startedAt} />
    : !isFreelancer && props.record.start
      ? <LiveWorkDuration record={props.record} fallback={liveResult} />
      : duration(0);
  const timingCaption = isFreelancer
    ? props.activeEntry ? t("today.focus.freelancerRunningHint") : t("today.focus.freelancerReadyHint")
    : props.record.end
      ? t("today.focus.startEnd", { start: digits(props.record.start), end: digits(props.record.end) })
      : props.record.start
        ? props.scheduledDayOff
          ? t("today.focus.startNoRequiredEnd", { start: digits(props.record.start) })
          : flexible
            ? t("today.focus.flexibleActive", { start: digits(props.record.start), target: duration(props.dailyTarget) })
            : t("today.focus.startSuggested", { start: digits(props.record.start), end: digits(props.suggestedExit) })
        : props.scheduledDayOff
          ? t("today.focus.exceptionHint")
          : flexible
            ? t("today.focus.flexibleReady", { target: duration(props.dailyTarget) })
            : t("today.focus.suggestedExit", { end: digits(props.suggestedExit) });

  if (isFreelancer) {
    const activity = props.activeEntry ?? props.projectTimerSession;
    const projectId = activity?.projectId ?? props.timerDraft.projectId;
    const project = props.data.projects.find((item) => item.id === projectId);
    const client = props.data.clients.find((item) => item.id === (activity?.clientId ?? project?.clientId));
    const task = activity?.task ?? props.timerDraft.task;

    return (
      <SurfaceCard className="dashboard-card mb-4 overflow-visible shadow-[0_6px_18px_rgba(0,0,0,.035)] dark:shadow-[0_10px_26px_rgba(0,0,0,.18)]">
        <div className="grid grid-cols-[minmax(390px,.9fr)_minmax(0,1.1fr)] max-[1100px]:grid-cols-1">
          <ProjectActivityDetails
            data={props.data}
            timerDraft={props.timerDraft}
            setTimerDraft={props.setTimerDraft}
            activeEntry={props.activeEntry}
            session={props.projectTimerSession}
            createClient={props.createClient}
            createProject={props.createProject}
            updateActiveDetails={props.updateProjectTimerDetails}
          />
          <div className="border-s border-[var(--dashboard-border)] bg-[linear-gradient(180deg,var(--surface-1),color-mix(in_srgb,var(--surface-2)_94%,transparent))] p-4 max-[1100px]:border-s-0 max-[1100px]:border-t max-[359px]:p-2.5 sm:p-5">
            <section
              data-project-session-controller
              className="rounded-[24px] border border-[color-mix(in_srgb,var(--accent)_22%,var(--dashboard-border))] bg-[color-mix(in_srgb,var(--surface-2)_88%,transparent)] p-4 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--accent)_5%,transparent)] max-[359px]:rounded-[20px] max-[359px]:p-3 sm:p-5"
            >
              <ProjectTimerHero
                activeEntry={props.activeEntry}
                session={props.projectTimerSession}
                projectName={project?.name}
                clientName={client?.name}
                task={task}
                canStart={Boolean(props.timerDraft.projectId)}
                onStart={() => props.startProjectTimer()}
                onPause={props.pauseProjectTimer}
                onResume={props.resumeProjectTimer}
                onFinish={props.finishProjectTimer}
              />
              <ProjectTodaySummary data={props.data} selectedDate={props.selectedDate} dailyTarget={props.dailyTarget} />
            </section>
          </div>
        </div>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard className="dashboard-card mb-4 overflow-hidden shadow-[0_6px_18px_rgba(0,0,0,.035)] dark:shadow-[0_10px_26px_rgba(0,0,0,.18)]">
      <div className={cn(
        "grid grid-cols-[minmax(0,1.02fr)_minmax(320px,.98fr)] max-[1050px]:grid-cols-1",
        !isEmployee && !isFreelancer && "grid-cols-[minmax(0,1.18fr)_minmax(300px,.82fr)]",
        isFreelancer && "grid-cols-[minmax(0,1fr)_minmax(480px,1fr)] max-[1180px]:grid-cols-1",
      )}>
        <div className={cn(isEmployee ? "grid content-start gap-4" : "grid grid-cols-12 content-center gap-4", isFreelancer ? "min-h-[220px] p-4 max-[359px]:p-3 sm:p-5" : "min-h-[290px] p-5 max-[359px]:min-h-0 max-[359px]:p-3 sm:p-6")}>
          {isEmployee ? (
            <div className="grid h-full gap-4 rounded-[24px] border border-[var(--dashboard-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-2)_88%,transparent),color-mix(in_srgb,var(--surface-1)_96%,transparent))] p-4 max-[359px]:gap-3 max-[359px]:rounded-[20px] max-[359px]:p-3 sm:p-5">
              <div className="grid gap-1">
                <strong className="flex items-center gap-2 text-[15px] font-black text-[var(--text)]">
                  {t("today.focus.employeeNote")}
                  <span className="grid size-7 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-strong)]">✎</span>
                </strong>
                <span className="text-[11px] leading-6 text-[var(--text-muted)]">{t("today.focus.employeeNoteHint")}</span>
              </div>

              <label className="grid min-w-0 flex-1 gap-2 text-xs font-bold text-[var(--text-muted)]">
                {t("today.focus.descriptionLabel")}
                <Textarea
                  rows={6}
                  className="min-h-[220px] flex-1 resize-none rounded-[20px] bg-[var(--surface-2)] leading-7 max-[359px]:min-h-[160px] max-[359px]:rounded-[16px]"
                  placeholder={t("today.focus.employeeNotePlaceholder")}
                  value={props.record.note}
                  onChange={(event) => props.updateRecord({ note: event.target.value })}
                />
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3.5 py-3 text-[11px] text-[var(--text-muted)]">
                <span>{t("today.focus.autoSave")}</span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-2.5 py-1.5 font-bold text-[var(--accent-strong)]"><Check className="size-3.5" /> {t("today.focus.saveNote")}</span>
              </div>
            </div>
          ) : <>
            <TimerRelationFields
              data={props.data}
              timerDraft={props.timerDraft}
              setTimerDraft={props.setTimerDraft}
              createClient={props.createClient}
              createProject={props.createProject}
            />
            <label className="col-span-4 grid min-w-0 gap-2 text-xs font-bold text-[var(--text-muted)] max-[720px]:col-span-12">{t("common.task")}<Input placeholder={t("today.focus.taskPlaceholder")} value={props.timerDraft.task} onChange={(event) => props.setTimerDraft((previous) => ({ ...previous, task: event.target.value }))} /></label>
            <label className="col-span-8 grid min-w-0 gap-2 text-xs font-bold text-[var(--text-muted)] max-[720px]:col-span-12">
              {t("today.focus.descriptionLabel")}
              <Input placeholder={t("today.focus.notePlaceholder")} value={props.timerDraft.note} onChange={(event) => props.setTimerDraft((previous) => ({ ...previous, note: event.target.value }))} />
            </label>
            <button type="button" aria-pressed={props.timerDraft.billable} className={cn("col-span-4 flex h-11 items-center justify-center gap-3 self-end rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs font-bold text-[var(--text-muted)] transition-colors hover:border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] hover:bg-[var(--surface-1)] max-[720px]:col-span-12", props.timerDraft.billable && "border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] bg-[var(--accent-soft)] text-[var(--accent-strong)]")} onClick={() => props.setTimerDraft((previous) => ({ ...previous, billable: !previous.billable }))}><span className={cn("relative h-5 w-9 rounded-full bg-[var(--border)] after:absolute after:right-1 after:top-1 after:size-3 after:rounded-full after:bg-[var(--surface-1)] after:transition-all after:content-['']", props.timerDraft.billable && "bg-[var(--accent)] after:right-5")} /> {t("common.billable")}</button>
          </>}
        </div>

        <div className={cn(
          "relative overflow-hidden border-s border-[var(--dashboard-border)] px-4 py-6 text-center max-[1050px]:border-s-0 max-[1050px]:border-t sm:px-6",
          isFreelancer
            ? "bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--accent)_14%,transparent),transparent_38%),linear-gradient(180deg,var(--surface-1),color-mix(in_srgb,var(--surface-2)_94%,var(--accent-soft)))] max-[1180px]:border-s-0 max-[1180px]:border-t"
            : "bg-[radial-gradient(circle_at_top,rgba(76,140,255,.16),transparent_34%),linear-gradient(180deg,color-mix(in_srgb,var(--surface-1)_94%,#120f2a),color-mix(in_srgb,var(--surface-accent)_90%,#0f1326))]",
        )}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_55%)]" aria-hidden="true" />
          <div className={cn(
            "relative mx-auto grid w-full justify-items-center gap-3 sm:gap-4",
            isFreelancer ? "max-w-[680px]" : "max-w-[352px] sm:max-w-[364px]",
          )}>
            {!isFreelancer && (
              <span className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--accent)_22%,var(--border))] bg-[var(--surface-glass)] px-4 py-2 text-[11px] font-black text-[var(--accent-strong)] shadow-[0_8px_20px_rgba(0,0,0,.08)]">
                <i className={cn("size-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_0_4px_var(--accent-soft)]", activeNow && "motion-safe:animate-pulse")} />
                {timerLabel}
                {activeNow && <em className="not-italic opacity-70">· {t("today.focus.live")}</em>}
              </span>
            )}

                          <TodayProgressArc value={progress} className="mt-1">
                <div className="grid justify-items-center gap-3"><span className="grid size-12 place-items-center rounded-full border border-[color-mix(in_srgb,var(--accent)_18%,var(--border))] bg-[color-mix(in_srgb,var(--surface-2)_72%,transparent)] text-[var(--accent-strong)] shadow-[0_8px_18px_rgba(0,0,0,.12)]"><Hourglass className="size-5" /></span><strong className="block max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-black leading-none text-[var(--text)] drop-shadow-[0_2px_18px_rgba(0,0,0,.16)]">{timerValue}</strong><span className="block text-sm font-bold text-[var(--text-muted)] sm:text-base">{props.scheduledDayOff ? t("today.focus.noRequiredHoursToday") : hasTarget ? t("today.focus.percentOfTarget", { percent: percent(progress) }) : t("today.focus.noTarget")}</span></div>
              </TodayProgressArc>

            {!isFreelancer && <small className="min-h-5 text-sm text-[var(--text-muted)] sm:text-[15px]">{timingCaption}</small>}

            {!isFreelancer && (
              <div className="mt-1 grid w-full grid-cols-2 gap-3 max-[520px]:grid-cols-1">
                {!props.record.start ? (
                  <Button onClick={props.startWork} className={cn("h-14 w-full text-base", isEmployee && "col-span-2")}><Play /> {props.scheduledDayOff ? t("today.focus.startAnyway") : t("today.focus.startDay")}</Button>
                ) : !props.record.end ? (
                  <Button variant="outline" onClick={props.finishWork} className="h-14 w-full text-base"><Square /> {t("today.focus.endDay")}</Button>
                ) : (
                  <div className={cn("flex min-h-14 items-center justify-center gap-2 rounded-[var(--control-radius)] border border-[color-mix(in_srgb,var(--accent)_22%,var(--border))] bg-[var(--accent-soft)] px-4 text-sm font-black text-[var(--accent-strong)] sm:text-base", isEmployee && "col-span-2")}><CheckCircle2 className="size-4" /> {t("today.focus.daySaved")}</div>
                )}
                {isEmployee && props.record.start && !props.record.end ? <Button variant="secondary" className="h-14 w-full text-base" disabled>{t("today.focus.recording")}</Button> : !isEmployee ? <Button onClick={() => props.toggleProjectTimer()} variant={props.activeEntry ? "outline" : "secondary"} className="h-14 w-full text-base">{props.activeEntry ? <><Square /> {t("today.focus.stopTimer")}</> : <><Play /> {t("today.focus.startTimer")}</>}</Button> : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
