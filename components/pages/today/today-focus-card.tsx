"use client";

import { Check, CheckCircle2, Play, Square } from "lucide-react";
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

type Props = Pick<TodayPageProps, "data" | "record" | "timerDraft" | "setTimerDraft" | "activeEntry" | "todayCalc" | "dailyTarget" | "suggestedExit" | "toggleProjectTimer" | "startWork" | "finishWork" | "updateRecord" | "createClient" | "createProject"> & {
  scheduledDayOff: boolean;
};

export function TodayFocusCard(props: Props) {
  const { digits, duration, percent, t } = useLocaleUi();
  const mode = props.data.settings.mode;
  const isEmployee = mode === "employee";
  const liveResult = useLiveWorkCalc(props.record, props.dailyTarget, props.todayCalc);
  const hasTarget = props.dailyTarget > 0;
  const progress = hasTarget ? Math.min(100, Math.round(liveResult.credited / props.dailyTarget * 100)) : 0;
  const timerLabel = props.activeEntry
    ? t("today.focus.projectRunning")
    : props.record.start && !props.record.end
      ? t("today.focus.working")
      : props.record.end
        ? t("today.focus.dayRecorded")
        : props.scheduledDayOff
          ? t("today.focus.scheduledOff")
          : t("today.focus.ready");
  const timerValue = props.activeEntry
    ? <LiveDuration startedAt={props.activeEntry.startedAt} />
    : props.record.start
      ? <LiveWorkDuration record={props.record} fallback={liveResult} />
      : duration(0);
  const timingCaption = props.record.end
    ? t("today.focus.startEnd", { start: digits(props.record.start), end: digits(props.record.end) })
    : props.record.start
      ? props.scheduledDayOff
        ? t("today.focus.startNoRequiredEnd", { start: digits(props.record.start) })
        : t("today.focus.startSuggested", { start: digits(props.record.start), end: digits(props.suggestedExit) })
      : props.scheduledDayOff
        ? t("today.focus.exceptionHint")
        : t("today.focus.suggestedExit", { end: digits(props.suggestedExit) });

  return (
    <SurfaceCard className="dashboard-card mb-4 overflow-hidden shadow-[0_6px_18px_rgba(0,0,0,.035)] dark:shadow-[0_10px_26px_rgba(0,0,0,.18)]">
      <div className={cn("grid grid-cols-[minmax(0,1.18fr)_minmax(340px,.82fr)] max-[1050px]:grid-cols-1", !isEmployee && "grid-cols-[minmax(0,1.2fr)_minmax(360px,.8fr)]")}>
        <div className={cn(isEmployee ? "grid content-center gap-3" : "grid grid-cols-12 content-center gap-4", "min-h-[290px] p-5 sm:p-6")}>
          {isEmployee && (
            <div className="grid gap-1">
              <strong className="flex items-center gap-2 text-[15px] font-black text-[var(--text)]">
                {t("today.focus.employeeNote")}
                <span className="grid size-7 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-strong)]">✎</span>
              </strong>
              <span className="text-[10px] leading-5 text-[var(--text-muted)]">{t("today.focus.employeeNoteHint")}</span>
            </div>
          )}
          {!isEmployee && <>
            <TimerRelationFields
              data={props.data}
              timerDraft={props.timerDraft}
              setTimerDraft={props.setTimerDraft}
              createClient={props.createClient}
              createProject={props.createProject}
            />
            <label className="col-span-4 grid min-w-0 gap-2 text-xs font-bold text-[var(--text-muted)] max-[720px]:col-span-12">{t("common.task")}<Input placeholder={t("today.focus.taskPlaceholder")} value={props.timerDraft.task} onChange={(event) => props.setTimerDraft((previous) => ({ ...previous, task: event.target.value }))} /></label>
          </>}
          <label className={cn("grid min-w-0 gap-2 text-xs font-bold text-[var(--text-muted)]", isEmployee ? "w-full" : "col-span-8 max-[720px]:col-span-12")}>
            {t("today.focus.descriptionLabel")}
            {isEmployee ? (
              <Textarea rows={4} className="min-h-32 resize-none rounded-[18px] bg-[var(--surface-2)] leading-7" placeholder={t("today.focus.employeeNotePlaceholder")} value={props.record.note} onChange={(event) => props.updateRecord({ note: event.target.value })} />
            ) : (
              <Input placeholder={t("today.focus.notePlaceholder")} value={props.timerDraft.note} onChange={(event) => props.setTimerDraft((previous) => ({ ...previous, note: event.target.value }))} />
            )}
          </label>
          {!isEmployee && <button type="button" aria-pressed={props.timerDraft.billable} className={cn("col-span-4 flex h-11 items-center justify-center gap-3 self-end rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs font-bold text-[var(--text-muted)] transition-colors hover:border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] hover:bg-[var(--surface-1)] max-[720px]:col-span-12", props.timerDraft.billable && "border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] bg-[var(--accent-soft)] text-[var(--accent-strong)]")} onClick={() => props.setTimerDraft((previous) => ({ ...previous, billable: !previous.billable }))}><span className={cn("relative h-5 w-9 rounded-full bg-[var(--border)] after:absolute after:right-1 after:top-1 after:size-3 after:rounded-full after:bg-[var(--surface-1)] after:transition-all after:content-['']", props.timerDraft.billable && "bg-[var(--accent)] after:right-5")} /> {t("common.billable")}</button>}
          {isEmployee && (
            <div className="flex items-center justify-between gap-3 text-[10px] text-[var(--text-muted)]">
              <span>{t("today.focus.autoSave")}</span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1.5 font-bold text-[var(--accent-strong)]"><Check className="size-3.5" /> {t("today.focus.saveNote")}</span>
            </div>
          )}
        </div>

        <div className="relative grid min-h-[290px] place-items-center overflow-hidden border-s border-[var(--dashboard-border)] bg-[linear-gradient(160deg,var(--surface-1),var(--surface-accent))] px-5 py-6 text-center max-[1050px]:border-s-0 max-[1050px]:border-t">
          <div className="pointer-events-none absolute inset-x-10 top-2 h-32 rounded-full bg-[var(--accent-soft)] opacity-70 blur-3xl" aria-hidden="true" />
          <div className="relative grid w-full max-w-[340px] place-items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--accent)_22%,var(--border))] bg-[var(--surface-glass)] px-3 py-1.5 text-[10px] font-black text-[var(--accent-strong)] shadow-[0_4px_14px_rgba(0,0,0,.04)]">
              <i className={cn("size-2 rounded-full bg-[var(--accent)] shadow-[0_0_0_4px_var(--accent-soft)]", (props.activeEntry || (props.record.start && !props.record.end)) && "motion-safe:animate-pulse")} />
              {timerLabel}
              {(props.activeEntry || (props.record.start && !props.record.end)) && <em className="not-italic opacity-70">· {t("today.focus.live")}</em>}
            </span>
            <TodayProgressArc value={progress}>
              <strong className="block text-[clamp(2.1rem,4vw,3.15rem)] font-black leading-none tracking-[-.04em] text-[var(--accent-strong)]">{timerValue}</strong>
              <span className="mt-2 block text-[10px] font-bold text-[var(--text-muted)]">{props.scheduledDayOff ? t("today.focus.noRequiredHoursToday") : hasTarget ? t("today.focus.percentOfTarget", { percent: percent(progress) }) : t("today.focus.noTarget")}</span>
            </TodayProgressArc>
            <small className="-mt-1 min-h-5 text-[10px] text-[var(--text-muted)]">{timingCaption}</small>
            <div className="mt-2 grid w-full max-w-[290px] grid-cols-2 gap-2 max-[520px]:grid-cols-1">
              {!isEmployee && <Button onClick={() => props.toggleProjectTimer()} className="w-full">{props.activeEntry ? <><Square /> {t("today.focus.stopTimer")}</> : <><Play /> {t("today.focus.startTimer")}</>}</Button>}
              {!props.record.start ? (
                <Button onClick={props.startWork} className={cn("w-full", isEmployee && "col-span-2")}><Play /> {props.scheduledDayOff ? t("today.focus.startAnyway") : t("today.focus.startDay")}</Button>
              ) : !props.record.end ? (
                <Button variant="outline" onClick={props.finishWork} className="w-full"><Square /> {t("today.focus.endDay")}</Button>
              ) : (
                <div className={cn("flex min-h-11 items-center justify-center gap-2 rounded-[var(--control-radius)] border border-[color-mix(in_srgb,var(--accent)_22%,var(--border))] bg-[var(--accent-soft)] px-4 text-xs font-black text-[var(--accent-strong)]", isEmployee && "col-span-2")}><CheckCircle2 className="size-4" /> {t("today.focus.daySaved")}</div>
              )}
              {isEmployee && props.record.start && !props.record.end && <Button variant="secondary" className="w-full" disabled>{t("today.focus.recording")}</Button>}
            </div>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
