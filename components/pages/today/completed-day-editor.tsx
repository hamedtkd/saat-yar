"use client";

import { AlertTriangle, CheckCircle2, Pencil, Play } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { localDateKey } from "@/lib/format";
import { registerSettingsDraft } from "@/lib/settings-draft-registry";
import { getWorkRecordChanges } from "@/lib/work-record-diff";
import { getTodayWorkspaceCapabilities } from "@/lib/workspace-capabilities";
import type { WorkRecord, WorkRecordPatch } from "@/lib/types";
import { CompletedDayEditActionBar, CompletedDayEditSavedNotice } from "./completed-day-edit-action-bar";
import { RecordChangeSummary } from "./record-change-summary";
import type { TodayPageProps } from "./types";
import { TodayFocusCard } from "./today-focus-card";
import { TodayTimeStrip } from "./today-time-strip";

export function CompletedDayEditor(props: TodayPageProps & { scheduledDayOff: boolean }) {
  const { t, digits } = useLocaleUi();
  const { record, selectedDate, updateRecord } = props;
  const capabilities = getTodayWorkspaceCapabilities(props.data.settings.mode);
  const completed = capabilities.attendance && Boolean(record.start && record.end);
  const autoClosed = Boolean(completed && record.needsReview && record.autoClosedAt);
  const canResume = Boolean(
    autoClosed &&
    selectedDate === localDateKey() &&
    (record.autoClosedReason === "page-exit" || record.autoClosedReason === "stale-session"),
  );
  const registryId = useId();
  const feedbackTimerRef = useRef<number | null>(null);
  const [editing, setEditing] = useState(!completed);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [baseline, setBaseline] = useState<WorkRecord>(record);
  const [draft, setDraft] = useState<WorkRecord>(record);
  const locked = completed && !editing;
  const changes = useMemo(() => getWorkRecordChanges(baseline, draft), [baseline, draft]);
  const dirty = changes.length > 0;
  const visibleRecord = completed ? draft : props.record;
  const updateVisibleRecord = completed
    ? (patch: WorkRecordPatch) => setDraft((current) => ({
        ...current,
        ...(typeof patch === "function" ? patch(current) : patch),
      }))
    : updateRecord;

  const beginEdit = useCallback(() => {
    if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = null;
    setSavedFeedback(false);
    setBaseline(record);
    setDraft(record);
    setEditing(true);
  }, [record]);
  const cancelEdit = useCallback(() => {
    if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = null;
    setSavedFeedback(false);
    setDraft(baseline);
    setEditing(false);
  }, [baseline]);
  const saveEdit = useCallback(() => {
    const saved = { ...draft, manuallyEdited: true, needsReview: false };
    updateRecord(saved);
    setBaseline(saved);
    setDraft(saved);
    setEditing(false);
    setSavedFeedback(true);
    if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = window.setTimeout(() => {
      feedbackTimerRef.current = null;
      setSavedFeedback(false);
    }, 3200);
  }, [draft, updateRecord]);

  useEffect(() => () => {
    if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current);
  }, []);

  useEffect(
    () => registerSettingsDraft(registryId, {
      label: t("today.edit.registryLabel", { date: digits(selectedDate) }),
      dirty: completed && editing && dirty,
      save: saveEdit,
      discard: cancelEdit,
    }),
    [cancelEdit, completed, digits, dirty, editing, registryId, saveEdit, selectedDate, t],
  );

  const childProps = { ...props, record: visibleRecord, updateRecord: updateVisibleRecord };

  return (
    <section data-completed-day-editor data-editing={completed && editing ? "true" : "false"} className={cn("relative", completed && editing && "pb-[calc(136px+env(safe-area-inset-bottom))] xl:pb-0")}>
      {completed && !editing && !savedFeedback && (
        <div className={`mb-4 grid gap-3 rounded-[var(--card-radius)] border px-4 py-3 ${
          autoClosed
            ? "border-[color-mix(in_srgb,var(--warning)_30%,var(--border))] bg-[var(--warning-soft)]"
            : "border-[color-mix(in_srgb,var(--success)_24%,var(--border))] bg-[var(--success-soft)]"
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              {autoClosed
                ? <AlertTriangle className="mt-0.5 size-5 text-[var(--warning)]" aria-hidden="true" />
                : <CheckCircle2 className="mt-0.5 size-5 text-[var(--success)]" aria-hidden="true" />}
              <div className="grid gap-0.5">
                <strong className="text-xs font-extrabold text-[var(--text)]">
                  {autoClosed ? t("today.edit.autoClosed") : t("today.edit.completed")}
                </strong>
                <span className="text-[10px] leading-5 text-[var(--text-muted)]">
                  {autoClosed
                    ? t("today.edit.autoClosedDetail", { time: digits(record.end || t("common.unknown")) })
                    : t("today.edit.readOnlyDetail")}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {canResume && (
                <Button type="button" onClick={props.resumeAutoClosedWork}><Play /> {t("today.edit.resume")}</Button>
              )}
              <Button type="button" variant="secondary" onClick={beginEdit}><Pencil /> {t("today.edit.start")}</Button>
            </div>
          </div>
        </div>
      )}

      {completed && editing && (
        <>
          <CompletedDayEditActionBar
            dirty={dirty}
            changeCount={changes.length}
            onCancel={cancelEdit}
            onReset={() => setDraft(baseline)}
            onSave={saveEdit}
          />
          <div className="mb-4 rounded-[var(--card-radius)] border border-[color-mix(in_srgb,var(--accent)_20%,var(--border))] bg-[var(--surface-1)] px-4 py-3">
            <RecordChangeSummary changes={changes} />
          </div>
        </>
      )}

      {completed && !editing && savedFeedback && <CompletedDayEditSavedNotice />}

      <fieldset
        data-completed-edit-fields={completed ? (editing ? "active" : "locked") : "live"}
        disabled={locked}
        className={cn(
          "min-w-0 transition-[filter,opacity] disabled:[&_button]:cursor-not-allowed disabled:[&_details]:opacity-80 disabled:[&_input]:cursor-not-allowed disabled:[&_textarea]:cursor-not-allowed",
          completed && editing && "[&_input]:border-[color-mix(in_srgb,var(--accent)_30%,var(--border))] [&_textarea]:border-[color-mix(in_srgb,var(--accent)_30%,var(--border))]",
          locked && "disabled:[&_input]:opacity-75 disabled:[&_textarea]:opacity-75",
        )}
      >
        <TodayFocusCard {...childProps} />
        {capabilities.attendance && <TodayTimeStrip {...childProps} showQuickActions={!completed} />}
      </fieldset>
    </section>
  );
}
