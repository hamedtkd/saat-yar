"use client";

import { BriefcaseBusiness, CirclePause, CirclePlay, Play, Square, TimerReset } from "lucide-react";

import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { ProjectTimerSession } from "@/lib/project-timer-session";
import type { TimeEntry } from "@/lib/types";
import { ProjectTimerElapsed } from "./project-timer-elapsed";

type Props = {
  activeEntry?: TimeEntry;
  session: ProjectTimerSession | null;
  projectName?: string;
  clientName?: string;
  task?: string;
  canStart: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
};

export function ProjectTimerHero(props: Props) {
  const { t } = useLocaleUi();
  const paused = props.session?.phase === "paused";
  const running = Boolean(props.activeEntry) && !paused;
  const idle = !running && !paused;
  const state = paused ? "paused" : running ? "running" : "idle";
  const status = paused ? t("today.timer.paused") : running ? t("today.timer.running") : t("today.focus.freelancerReady");
  const activityTitle = props.task || props.projectName || t("today.timer.ready");

  return (
    <div data-project-timer-hero data-project-timer-state={state} className="grid gap-3.5 max-[359px]:gap-3 sm:gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 max-[359px]:gap-2">
        <strong className="inline-flex items-center gap-2 text-xs font-black text-[var(--text)] sm:text-sm">
          <TimerReset aria-hidden="true" className="size-4.5 text-[var(--accent-strong)]" />
          {t("app.name")}
        </strong>
        <span
          role="status"
          aria-live="polite"
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black max-[359px]:gap-1.5 max-[359px]:px-2.5 max-[359px]:py-1 max-[359px]:text-[9px]",
            paused
              ? "border-[color-mix(in_srgb,var(--warning)_28%,var(--border))] bg-[var(--warning-soft)] text-[var(--warning)]"
              : "border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] bg-[var(--accent-soft)] text-[var(--accent-strong)]",
          )}
        >
          <i className={cn("size-2.5 rounded-full", paused ? "bg-[var(--warning)]" : "bg-[var(--accent)]", running && "motion-safe:animate-pulse")} />
          {status}
        </span>
      </div>

      <div className="grid min-w-0 justify-items-center gap-2.5 text-center max-[359px]:gap-2 sm:gap-3">
        <div className="grid gap-1">
          <h2 className="text-base font-black text-[var(--text)] max-[359px]:text-[15px] sm:text-lg">{t("today.timer.title")}</h2>
          <p className="max-w-[520px] text-[10px] leading-5 text-[var(--text-muted)] max-[359px]:max-w-[250px] max-[359px]:text-[9px] max-[359px]:leading-4 sm:text-[11px]">
            {idle ? t("today.timer.idleHint") : paused ? t("today.timer.pausedHint") : t("today.timer.runningHint")}
          </p>
        </div>
        <ProjectTimerElapsed activeEntry={props.activeEntry} session={props.session} className={cn(paused && "opacity-80")} />
      </div>

      <div className="rounded-[16px] border border-[var(--dashboard-border)] bg-[color-mix(in_srgb,var(--surface-2)_72%,transparent)] px-3.5 py-3 text-center max-[359px]:rounded-[14px] max-[359px]:px-3 max-[359px]:py-2.5 sm:px-4">
        <strong className="flex min-w-0 items-center justify-center gap-2 truncate text-xs font-black text-[var(--text)] max-[359px]:text-[11px] sm:text-sm">
          <BriefcaseBusiness aria-hidden="true" className="size-4 shrink-0 text-[var(--accent-strong)]" />
          {activityTitle}
        </strong>
        <span className="mt-1 block truncate text-[10px] text-[var(--text-muted)] max-[359px]:text-[9px] sm:text-[11px]">
          {props.projectName ? `${t("common.project")}: ${props.projectName}` : t("today.timer.chooseProject")}
          {props.clientName ? ` · ${props.clientName}` : ""}
        </span>
      </div>

      {idle ? (
        <Button data-freelancer-primary-timer onClick={props.onStart} disabled={!props.canStart} className="h-11 w-full rounded-[14px] text-sm font-black max-[359px]:h-10 max-[359px]:text-[13px] sm:h-12">
          <Play aria-hidden="true" /> {t("today.timer.start")}
        </Button>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 max-[460px]:grid-cols-1 max-[359px]:gap-2">
          <Button
            data-freelancer-primary-timer
            onClick={paused ? props.onResume : props.onPause}
            className="h-11 rounded-[14px] text-sm font-black max-[359px]:h-10 max-[359px]:text-[13px] sm:h-12"
          >
            {paused ? <CirclePlay aria-hidden="true" /> : <CirclePause aria-hidden="true" />}
            {paused ? t("today.timer.resume") : t("today.timer.pause")}
          </Button>
          <Button onClick={props.onFinish} variant="destructive" className="h-11 rounded-[14px] text-sm font-black max-[359px]:h-10 max-[359px]:text-[13px] sm:h-12">
            <Square aria-hidden="true" /> {t("today.timer.finish")}
          </Button>
        </div>
      )}
    </div>
  );
}
