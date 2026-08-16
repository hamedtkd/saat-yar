"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ExternalCalendarEvent } from "@/lib/calendar-integration/types";

export function CalendarEventDeleteDialog({ open, onOpenChange, event, busy, onDelete }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: ExternalCalendarEvent;
  busy: boolean;
  onDelete: (options: { series: boolean; notifyAttendees: boolean }) => Promise<void>;
}) {
  const { t } = useLocaleUi();
  const [notifyAttendees, setNotifyAttendees] = useState(true);
  const [operationFailed, setOperationFailed] = useState(false);
  const runDelete = async (series: boolean) => {
    setOperationFailed(false);
    try {
      await onDelete({ series, notifyAttendees });
      onOpenChange(false);
    } catch {
      setOperationFailed(true);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2"><Trash2 className="size-4 text-[var(--danger)]" /> {t("calendar.google.deleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{event.recurringEventId ? t("calendar.google.deleteRecurringDescription") : t("calendar.google.deleteDescription")}</AlertDialogDescription>
        </AlertDialogHeader>
        <label className="!flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5">
          <Checkbox checked={notifyAttendees} onCheckedChange={setNotifyAttendees} />
          <span className="grid gap-0.5"><strong className="text-[10px] text-[var(--text)]">{t("calendar.google.notifyGuests")}</strong><span className="text-[9px] leading-5 text-[var(--text-muted)]">{t("calendar.google.notifyGuestsHint")}</span></span>
        </label>
        {operationFailed && <p role="alert" className="rounded-xl border border-[color-mix(in_srgb,var(--danger)_28%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_8%,var(--surface-2))] px-3 py-2 text-[10px] leading-5 text-[var(--danger)]">{t("calendar.google.operationFailed")}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{t("common.cancel")}</AlertDialogCancel>
          {event.recurringEventId && <Button type="button" variant="destructive" disabled={busy} onClick={() => { void runDelete(true); }}>{t("calendar.google.deleteSeries")}</Button>}
          <Button type="button" variant="destructive" disabled={busy} onClick={() => { void runDelete(false); }}>{event.recurringEventId ? t("calendar.google.deleteOccurrence") : t("common.delete")}</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
