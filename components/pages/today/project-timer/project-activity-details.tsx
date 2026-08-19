"use client";

import { BriefcaseBusiness, ListTodo } from "lucide-react";

import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { TimerRelationFields } from "@/components/pages/today/timer-relation-fields";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/cn";
import type { ProjectTimerSession } from "@/lib/project-timer-session";
import type { AppData, ClientDraft, ProjectDraft, TimeEntry, TimerDraft } from "@/lib/types";

type Props = {
  data: AppData;
  timerDraft: TimerDraft;
  setTimerDraft: React.Dispatch<React.SetStateAction<TimerDraft>>;
  activeEntry?: TimeEntry;
  session: ProjectTimerSession | null;
  createClient: (draft: ClientDraft) => string | undefined;
  createProject: (draft: ProjectDraft) => string | undefined;
  updateActiveDetails: (patch: Partial<Pick<TimeEntry, "task" | "note" | "billable">>) => void;
};

export function ProjectActivityDetails(props: Props) {
  const { t } = useLocaleUi();
  const active = Boolean(props.activeEntry || props.session);
  const activity = props.activeEntry ?? props.session;
  const task = activity?.task ?? props.timerDraft.task;
  const note = activity?.note ?? props.timerDraft.note;
  const billable = activity?.billable ?? props.timerDraft.billable;
  const projectId = activity?.projectId;

  const update = (patch: Partial<Pick<TimeEntry, "task" | "note" | "billable">>) => {
    if (active) props.updateActiveDetails(patch);
    else props.setTimerDraft((previous) => ({ ...previous, ...patch }));
  };

  return (
    <section data-project-activity-details className="grid h-full content-start gap-5 p-5 max-[359px]:gap-3.5 max-[359px]:p-3 sm:p-6 lg:p-7">
      <header className="flex items-start justify-between gap-4 border-b border-[var(--dashboard-border)] pb-4 max-[359px]:grid max-[359px]:gap-2.5 max-[359px]:pb-3">
        <div className="grid gap-1">
          <h2 className="flex items-center gap-2 text-lg font-black text-[var(--text)] max-[359px]:text-base sm:text-xl">
            <BriefcaseBusiness aria-hidden="true" className="size-5 text-[var(--accent-strong)]" />
            {active ? t("today.timer.activityCurrent") : t("today.timer.activityDetails")}
          </h2>
          <p className="text-[11px] leading-6 text-[var(--text-muted)] max-[359px]:text-[10px] max-[359px]:leading-5">
            {active ? t("today.timer.activityCurrentHint") : t("today.timer.activityDetailsHint")}
          </p>
        </div>
        {active && (
          <span className="shrink-0 rounded-full border border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] bg-[var(--accent-soft)] px-3 py-1.5 text-[10px] font-black text-[var(--accent-strong)] max-[359px]:justify-self-start max-[359px]:px-2.5 max-[359px]:py-1 max-[359px]:text-[9px]">
            {t("today.timer.relationsLocked")}
          </span>
        )}
      </header>

      <TimerRelationFields
        data={props.data}
        timerDraft={props.timerDraft}
        setTimerDraft={props.setTimerDraft}
        createClient={props.createClient}
        createProject={props.createProject}
        lockedProjectId={projectId}
        disabled={active}
        variant="panel"
      />

      <label className="grid gap-2 text-xs font-bold text-[var(--text-muted)]">
        <span className="flex items-center gap-2"><ListTodo aria-hidden="true" className="size-4 text-[var(--accent-strong)]" />{t("common.task")}</span>
        <Input
          className="h-12 rounded-[15px] bg-[color-mix(in_srgb,var(--surface-2)_92%,transparent)] max-[359px]:h-11 max-[359px]:rounded-[13px]"
          placeholder={t("today.focus.taskPlaceholder")}
          value={task}
          onChange={(event) => update({ task: event.target.value })}
        />
      </label>

      <label className="grid gap-2 text-xs font-bold text-[var(--text-muted)]">
        {t("today.focus.descriptionLabel")}
        <Textarea
          rows={4}
          className="min-h-[104px] resize-none rounded-[16px] bg-[color-mix(in_srgb,var(--surface-2)_92%,transparent)] leading-6 max-[359px]:min-h-[88px] max-[359px]:rounded-[14px]"
          placeholder={t("today.focus.notePlaceholder")}
          value={note}
          onChange={(event) => update({ note: event.target.value })}
        />
      </label>

      <button
        type="button"
        aria-pressed={billable}
        onClick={() => update({ billable: !billable })}
        className={cn(
          "flex min-h-16 items-center justify-between gap-4 rounded-[18px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] px-4 text-start transition-[border-color,background-color,transform] max-[359px]:min-h-14 max-[359px]:gap-3 max-[359px]:rounded-[15px] max-[359px]:px-3",
          "hover:border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] active:scale-[.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]",
          billable && "border-[color-mix(in_srgb,var(--accent)_34%,var(--border))] bg-[color-mix(in_srgb,var(--accent-soft)_72%,var(--surface-2))]",
        )}
      >
        <span className="grid gap-0.5">
          <strong className="text-sm font-black text-[var(--text)] max-[359px]:text-[13px]">{t("common.billable")}</strong>
          <small className="text-[10px] text-[var(--text-muted)] max-[359px]:text-[9px]">{t("today.timer.billableHint")}</small>
        </span>
        <span dir="ltr" aria-hidden="true" className={cn("relative h-7 w-12 rounded-full max-[359px]:h-6 max-[359px]:w-11 bg-[var(--border)] transition-colors after:absolute after:left-1 after:top-1 after:size-5 max-[359px]:after:size-4 after:rounded-full after:bg-[var(--surface-1)] after:shadow-sm after:transition-transform after:content-['']", billable && "bg-[var(--accent)] after:translate-x-5 max-[359px]:after:translate-x-5")} />
      </button>
    </section>
  );
}
