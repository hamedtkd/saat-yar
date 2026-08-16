"use client";

import { useMemo, useState } from "react";
import { CalendarPlus2, LoaderCircle, Trash2 } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { JalaliDatePicker, TimePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createExternalCalendarDraft, draftFromExternalCalendarEvent, validateExternalCalendarDraft } from "@/lib/calendar-integration/draft";
import type { ExternalCalendarEditScope, ExternalCalendarEvent, ExternalCalendarEventDraft, ExternalCalendarEventRepeat, ExternalCalendarSource } from "@/lib/calendar-integration/types";
import { CalendarEventDeleteDialog } from "./calendar-event-delete-dialog";
import { CalendarRecurringEditScope } from "./calendar-recurring-edit-scope";

export function CalendarEventDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateKey: string;
  defaultCalendarId: string;
  calendars: ExternalCalendarSource[];
  event?: ExternalCalendarEvent;
  busy: boolean;
  onCreate: (draft: ExternalCalendarEventDraft) => Promise<void>;
  onUpdate: (event: ExternalCalendarEvent, draft: ExternalCalendarEventDraft, options?: { scope?: ExternalCalendarEditScope }) => Promise<void>;
  onDelete: (event: ExternalCalendarEvent, options: { series: boolean; notifyAttendees: boolean }) => Promise<void>;
}) {
  const sessionKey = `${props.event?.calendarId ?? "new"}:${props.event?.id ?? props.dateKey}:${props.open ? "open" : "closed"}`;
  return <CalendarEventDialogSession key={sessionKey} {...props} />;
}

function CalendarEventDialogSession({ open, onOpenChange, dateKey, defaultCalendarId, calendars, event, busy, onCreate, onUpdate, onDelete }: Parameters<typeof CalendarEventDialog>[0]) {
  const { t } = useLocaleUi();
  const initialDraft = useMemo(() => event ? draftFromExternalCalendarEvent(event) : createExternalCalendarDraft(dateKey, defaultCalendarId), [dateKey, defaultCalendarId, event]);
  const [draft, setDraft] = useState(initialDraft);
  const [error, setError] = useState<ReturnType<typeof validateExternalCalendarDraft>>(null);
  const [operationFailed, setOperationFailed] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editScope, setEditScope] = useState<ExternalCalendarEditScope>("occurrence");
  const editing = Boolean(event);
  const seriesEditing = Boolean(event?.recurringEventId && editScope === "series");
  const writableCalendars = calendars.filter((calendar) => calendar.writable);
  const update = <K extends keyof ExternalCalendarEventDraft>(key: K, value: ExternalCalendarEventDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    const nextError = validateExternalCalendarDraft(draft);
    setError(nextError);
    setOperationFailed(false);
    if (nextError) return;
    try {
      if (event) await onUpdate(event, draft, { scope: editScope });
      else await onCreate(draft);
      onOpenChange(false);
    } catch {
      setOperationFailed(true);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent data-calendar-event-dialog className="flex max-h-[min(760px,calc(100dvh-24px))] flex-col gap-0 overflow-hidden p-0 sm:w-[min(94vw,640px)] sm:p-0" style={{ width: "min(94vw,640px)" }}>
          <DialogHeader data-calendar-event-dialog-header className="shrink-0 border-b border-[var(--border)] bg-[var(--surface-1)] p-4 pe-14 sm:p-5 sm:pe-14">
            <DialogTitle className="flex items-center gap-2"><CalendarPlus2 className="size-5 text-[var(--accent-strong)]" /> {editing ? t("calendar.google.editEvent") : t("calendar.google.createEvent")}</DialogTitle>
            <DialogDescription>{editing && event?.recurringEventId ? t("calendar.google.editOccurrenceHint") : t("calendar.google.eventDialogDescription")}</DialogDescription>
          </DialogHeader>

          <div data-calendar-event-dialog-body className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
            <div className="grid gap-4">
              <label className="grid gap-1.5 text-[10px] font-bold text-[var(--text-muted)]"><span>{t("calendar.google.eventTitle")}</span><Input autoFocus maxLength={140} value={draft.title} onChange={(input) => { update("title", input.target.value); setError(null); }} placeholder={t("calendar.google.eventTitlePlaceholder")} />{error === "title" && <span className="text-[9px] text-[var(--danger)]">{t("calendar.google.validation.title")}</span>}</label>

              {editing && event?.recurringEventId ? <CalendarRecurringEditScope value={editScope} onChange={setEditScope} /> : null}

              <label className="grid gap-1.5 text-[10px] font-bold text-[var(--text-muted)]"><span>{t("calendar.google.calendar")}</span><Select value={draft.calendarId} disabled={editing} onValueChange={(calendarId) => update("calendarId", calendarId)}><SelectTrigger><SelectValue placeholder={t("calendar.google.calendarPlaceholder")} /></SelectTrigger><SelectContent>{writableCalendars.map((calendar) => <SelectItem key={calendar.id} value={calendar.id}>{calendar.name}{calendar.primary ? ` · ${t("calendar.google.primary")}` : ""}</SelectItem>)}</SelectContent></Select>{error === "calendar" && <span className="text-[9px] text-[var(--danger)]">{t("calendar.google.validation.calendar")}</span>}</label>

              <label className="!flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5"><Checkbox checked={draft.allDay} disabled={seriesEditing} onCheckedChange={(allDay) => update("allDay", allDay)} /><span className="text-[10px] font-bold text-[var(--text)]">{t("calendar.google.allDay")}</span></label>

              <div className="grid gap-3 sm:grid-cols-2">
                {!seriesEditing && <><label className="grid gap-1.5 text-[10px] font-bold text-[var(--text-muted)]"><span>{t("calendar.google.startDate")}</span><JalaliDatePicker value={draft.startDateKey} onChange={(startDateKey) => { update("startDateKey", startDateKey); if (draft.endDateKey < startDateKey) update("endDateKey", startDateKey); setError(null); }} /></label><label className="grid gap-1.5 text-[10px] font-bold text-[var(--text-muted)]"><span>{t("calendar.google.endDate")}</span><JalaliDatePicker value={draft.endDateKey} onChange={(endDateKey) => { update("endDateKey", endDateKey); setError(null); }} /></label></>}
                {!draft.allDay && <><label className="grid gap-1.5 text-[10px] font-bold text-[var(--text-muted)]"><span>{t("common.start")}</span><TimePicker value={draft.startTime} onChange={(startTime) => { update("startTime", startTime); setError(null); }} /></label><label className="grid gap-1.5 text-[10px] font-bold text-[var(--text-muted)]"><span>{t("common.end")}</span><TimePicker value={draft.endTime} onChange={(endTime) => { update("endTime", endTime); setError(null); }} /></label></>}
              </div>
              {(error === "date" || error === "time") && <p className="-mt-2 text-[9px] text-[var(--danger)]">{t(`calendar.google.validation.${error}`)}</p>}

              {!editing && <label className="grid gap-1.5 text-[10px] font-bold text-[var(--text-muted)]"><span>{t("calendar.google.repeat")}</span><Select value={draft.repeat} onValueChange={(repeat) => update("repeat", repeat as ExternalCalendarEventRepeat)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">{t("calendar.google.repeat.none")}</SelectItem><SelectItem value="daily">{t("calendar.google.repeat.daily")}</SelectItem><SelectItem value="weekly">{t("calendar.google.repeat.weekly")}</SelectItem><SelectItem value="monthly">{t("calendar.google.repeat.monthly")}</SelectItem></SelectContent></Select></label>}

              <label className="grid gap-1.5 text-[10px] font-bold text-[var(--text-muted)]"><span>{t("calendar.google.location")}</span><Input maxLength={240} value={draft.location} onChange={(input) => update("location", input.target.value)} placeholder={t("calendar.google.locationPlaceholder")} /></label>

              <label className="!flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3"><Checkbox className="mt-0.5 shrink-0" checked={draft.notifyAttendees} onCheckedChange={(notifyAttendees) => update("notifyAttendees", notifyAttendees)} /><span className="min-w-0 flex-1"><strong className="block text-[10px] leading-5 text-[var(--text)]">{t("calendar.google.notifyGuests")}</strong><span className="mt-0.5 block text-[9px] leading-5 font-normal text-[var(--text-muted)]">{t("calendar.google.notifyGuestsHint")}</span></span></label>

              <label className="grid gap-1.5 text-[10px] font-bold text-[var(--text-muted)]"><span>{t("calendar.google.descriptionField")}</span><Textarea className="min-h-28" maxLength={1200} value={draft.description} onChange={(input) => update("description", input.target.value)} placeholder={t("calendar.google.descriptionPlaceholder")} /></label>
              {operationFailed && <p role="alert" className="rounded-xl border border-[color-mix(in_srgb,var(--danger)_28%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_8%,var(--surface-2))] px-3 py-2 text-[10px] leading-5 text-[var(--danger)]">{t("calendar.google.operationFailed")}</p>}
            </div>
          </div>

          <DialogFooter data-calendar-event-dialog-footer className="shrink-0 justify-between border-t border-[var(--border)] bg-[var(--surface-1)] p-4 sm:p-5">
            <div>{editing && event?.editable ? <Button type="button" variant="ghost" className="text-[var(--danger)]" disabled={busy} onClick={() => setDeleteOpen(true)}><Trash2 /> {t("common.delete")}</Button> : null}</div>
            <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button><Button type="button" disabled={busy || !writableCalendars.length} onClick={() => { void submit(); }}>{busy && <LoaderCircle className="animate-spin motion-reduce:animate-none" />} {editing ? t("common.save") : t("calendar.google.createEvent")}</Button></div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {event && <CalendarEventDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} event={event} busy={busy} onDelete={async (options) => { await onDelete(event, options); onOpenChange(false); }} />}
    </>
  );
}
