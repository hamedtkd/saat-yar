"use client";

import { PencilLine } from "lucide-react";
import { useState } from "react";

import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { TimePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { applyAttendanceEventEdit, type AttendanceEventDraft, type AttendanceEventTarget } from "@/lib/attendance-event-edit";
import type { WorkRecord, WorkRecordPatch } from "@/lib/types";

export function AttendanceEventEditDialog({ record, target, onClose, updateRecord }: {
  record: WorkRecord;
  target: AttendanceEventTarget;
  onClose: () => void;
  updateRecord: (patch: WorkRecordPatch) => void;
}) {
  const { t } = useLocaleUi();
  const breakItem = target.kind === "break" ? record.breaks.find((item) => item.id === target.id) : undefined;
  const [draft, setDraft] = useState<AttendanceEventDraft>(() => {
    if (target.kind === "clock-in") return { start: record.start };
    if (target.kind === "clock-out") return { end: record.end };
    if (target.kind === "lunch") return { start: record.lunchStart ?? "", end: record.lunchEnd ?? "", paid: Boolean(record.lunchPaid) };
    return { start: breakItem?.start ?? "", end: breakItem?.end ?? "", title: breakItem?.title ?? "", paid: Boolean(breakItem?.paid) };
  });

  const save = () => {
    updateRecord((current) => applyAttendanceEventEdit(current, target, draft));
    onClose();
  };

  const typeLabel = target.kind === "clock-in" ? t("common.clockIn") : target.kind === "clock-out" ? t("common.clockOut") : target.kind === "lunch" ? t("common.lunch") : t("common.break");
  const singleTime = target.kind === "clock-in" || target.kind === "clock-out";

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent data-attendance-edit-dialog className="w-[min(94vw,520px)] rounded-[22px] p-0">
        <DialogHeader className="border-b border-[var(--dashboard-border)] px-5 py-4 text-start sm:px-6">
          <DialogTitle className="flex items-center gap-2 text-base font-black">
            <PencilLine aria-hidden="true" className="size-4 text-[var(--accent-strong)]" />
            {t("today.attendance.editTitle", { type: typeLabel })}
          </DialogTitle>
          <DialogDescription className="text-start text-[10px] leading-6">
            {t("today.attendance.editDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 px-5 py-4 sm:px-6">
          {singleTime ? (
            <label className="grid gap-2">
              <span>{t("common.time")}</span>
              <TimePicker
                value={target.kind === "clock-in" ? draft.start ?? "" : draft.end ?? ""}
                onChange={(value) => setDraft(target.kind === "clock-in" ? { start: value } : { end: value })}
              />
            </label>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2">
                <span>{t("common.start")}</span>
                <TimePicker value={draft.start ?? ""} onChange={(start) => setDraft((current) => ({ ...current, start }))} />
              </label>
              <label className="grid gap-2">
                <span>{t("common.end")}</span>
                <TimePicker value={draft.end ?? ""} onChange={(end) => setDraft((current) => ({ ...current, end }))} />
              </label>
            </div>
          )}

          {target.kind === "break" && (
            <label className="grid gap-2">
              <span>{t("common.note")}</span>
              <Input value={draft.title ?? ""} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
            </label>
          )}

          {(target.kind === "lunch" || target.kind === "break") && (
            <label className="flex! cursor-pointer items-center justify-between gap-3 rounded-[14px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 py-3 text-[11px] font-bold text-[var(--text)]">
              <span>{t("today.attendance.paidEdit")}</span>
              <Checkbox checked={Boolean(draft.paid)} onCheckedChange={(paid) => setDraft((current) => ({ ...current, paid }))} />
            </label>
          )}
        </div>

        <DialogFooter className="border-t border-[var(--dashboard-border)] px-5 py-4 sm:px-6">
          <Button type="button" variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
          <Button type="button" onClick={save}>{t("common.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
