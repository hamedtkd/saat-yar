"use client";

import { CheckCircle2, Pencil, RotateCcw, Save, X } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { registerSettingsDraft } from "@/lib/settings-draft-registry";
import { getWorkRecordChanges } from "@/lib/work-record-diff";
import type { WorkRecord } from "@/lib/types";
import { RecordChangeSummary } from "./record-change-summary";
import type { TodayPageProps } from "./types";
import { TodayFocusCard } from "./today-focus-card";
import { TodayTimeStrip } from "./today-time-strip";

export function CompletedDayEditor(props: TodayPageProps) {
  const completed = Boolean(props.record.start && props.record.end);
  const registryId = useId();
  const [editing, setEditing] = useState(!completed);
  const [baseline, setBaseline] = useState<WorkRecord>(props.record);
  const [draft, setDraft] = useState<WorkRecord>(props.record);
  const locked = completed && !editing;
  const changes = useMemo(() => getWorkRecordChanges(baseline, draft), [baseline, draft]);
  const dirty = changes.length > 0;
  const visibleRecord = completed ? draft : props.record;
  const updateVisibleRecord = completed
    ? (patch: Partial<WorkRecord>) => setDraft((current) => ({ ...current, ...patch }))
    : props.updateRecord;

  const beginEdit = () => {
    setBaseline(props.record);
    setDraft(props.record);
    setEditing(true);
  };
  const cancelEdit = () => {
    setDraft(baseline);
    setEditing(false);
  };
  const saveEdit = () => {
    const saved = { ...draft, manuallyEdited: true, needsReview: false };
    props.updateRecord(saved);
    setBaseline(saved);
    setDraft(saved);
    setEditing(false);
  };
  useEffect(
    () => registerSettingsDraft(registryId, {
      label: `ویرایش رکورد ${props.selectedDate}`,
      dirty: completed && editing && dirty,
      save: saveEdit,
      discard: cancelEdit,
    }),
    [cancelEdit, completed, dirty, editing, props.selectedDate, registryId, saveEdit],
  );

  const childProps = { ...props, record: visibleRecord, updateRecord: updateVisibleRecord };

  return <>
    {completed && (
      <div className="mb-4 grid gap-3 rounded-[var(--card-radius)] border border-[color-mix(in_srgb,var(--success)_24%,var(--border))] bg-[var(--success-soft)] px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 text-[var(--success)]" aria-hidden="true" />
            <div className="grid gap-0.5">
              <strong className="text-xs font-extrabold text-[var(--text)]">ثبت این روز کامل شده است</strong>
              <span className="text-[10px] leading-5 text-[var(--text-muted)]">ویرایش تاریخی داخل پیش‌نویس انجام می‌شود و تا ذخیره، داده اصلی تغییر نمی‌کند.</span>
            </div>
          </div>
          {!editing ? (
            <Button type="button" variant="secondary" onClick={beginEdit}><Pencil /> ویرایش این روز</Button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="ghost" onClick={cancelEdit}><X /> انصراف</Button>
              <Button type="button" variant="outline" disabled={!dirty} onClick={() => setDraft(baseline)}><RotateCcw /> بازنشانی</Button>
              <Button type="button" disabled={!dirty} onClick={saveEdit}><Save /> ذخیره تغییرات</Button>
            </div>
          )}
        </div>
        {editing && <RecordChangeSummary changes={changes} />}
      </div>
    )}
    <fieldset disabled={locked} className="min-w-0 disabled:[&_input]:cursor-not-allowed disabled:[&_textarea]:cursor-not-allowed disabled:[&_button]:cursor-not-allowed disabled:[&_details]:opacity-80">
      <TodayFocusCard {...childProps} />
      <TodayTimeStrip {...childProps} showQuickActions={!completed} />
    </fieldset>
  </>;
}
