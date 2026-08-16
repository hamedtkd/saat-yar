"use client";

import { useState } from "react";
import { CalendarClock, ExternalLink, Focus, MapPin, Pencil, Trash2, UsersRound } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { eventOccursOnDate } from "@/lib/calendar-integration/google-calendar";
import type { ExternalCalendarEvent } from "@/lib/calendar-integration/types";
import { CalendarEventDeleteDialog } from "./calendar-event-delete-dialog";

const kindIcons = {
  meeting: UsersRound,
  focus: Focus,
  availability: MapPin,
  activity: CalendarClock,
} as const;

function EventTime({ event }: { event: ExternalCalendarEvent }) {
  const { t, time } = useLocaleUi();
  if (event.allDay) return <span>{t("calendar.google.allDay")}</span>;
  return <span dir="ltr">{time(event.start)}–{time(event.end)}</span>;
}

export function CalendarEventList({ events, dateKey, limit, onEdit, onDelete, busy = false }: {
  events: ExternalCalendarEvent[];
  dateKey: string;
  limit?: number;
  onEdit?: (event: ExternalCalendarEvent) => void;
  onDelete?: (event: ExternalCalendarEvent, options: { series: boolean; notifyAttendees: boolean }) => Promise<void>;
  busy?: boolean;
}) {
  const { t } = useLocaleUi();
  const [deletingEvent, setDeletingEvent] = useState<ExternalCalendarEvent | null>(null);
  const dayEvents = events.filter((event) => eventOccursOnDate(event, dateKey));
  const visible = typeof limit === "number" ? dayEvents.slice(0, limit) : dayEvents;

  if (!dayEvents.length) {
    return <div data-calendar-empty className="rounded-[14px] border border-dashed border-[var(--dashboard-border)] bg-[var(--surface-2)] px-4 py-5 text-center text-[10px] leading-5 text-[var(--text-muted)]">{t("calendar.google.emptyDay")}</div>;
  }

  return (
    <>
      <div className="grid gap-2" data-calendar-event-list>
        {visible.map((event) => {
          const Icon = kindIcons[event.kind];
          return (
            <article key={`${event.calendarId}:${event.id}`} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 py-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><Icon aria-hidden="true" className="size-4" /></span>
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <strong className="truncate text-[11px] text-[var(--text)]">{event.title || t("calendar.google.busy")}</strong>
                  <span className="shrink-0 rounded-full bg-[var(--surface-1)] px-2 py-0.5 text-[8px] font-bold text-[var(--text-muted)]">{t(`calendar.google.kind.${event.kind}`)}</span>
                </div>
                <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[9px] text-[var(--text-muted)]">
                  <EventTime event={event} /><span aria-hidden="true">•</span><span className="truncate">{event.calendarName}</span>{event.location ? <><span aria-hidden="true">•</span><span className="truncate">{event.location}</span></> : null}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {event.editable && onEdit ? <Button type="button" variant="ghost" size="icon" className="size-8 rounded-lg" onClick={() => onEdit(event)} aria-label={t("calendar.google.editEvent")}><Pencil aria-hidden="true" className="size-3.5" /></Button> : null}
                {event.editable && onDelete ? <Button type="button" variant="ghost" size="icon" className="size-8 rounded-lg text-[var(--danger)] hover:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] hover:text-[var(--danger)]" disabled={busy} onClick={() => setDeletingEvent(event)} aria-label={t("calendar.google.quickDelete")}><Trash2 aria-hidden="true" className="size-3.5" /></Button> : null}
                {event.htmlLink ? <a href={event.htmlLink} target="_blank" rel="noreferrer" className={cn("grid size-8 place-items-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)]")} aria-label={t("calendar.google.openEvent")}><ExternalLink aria-hidden="true" className="size-3.5" /></a> : null}
              </div>
            </article>
          );
        })}
        {limit && dayEvents.length > limit ? <p className="px-1 text-[9px] text-[var(--text-muted)]">{t("calendar.google.moreEvents", { count: dayEvents.length - limit })}</p> : null}
      </div>
      {deletingEvent && onDelete ? <CalendarEventDeleteDialog open onOpenChange={(open) => { if (!open) setDeletingEvent(null); }} event={deletingEvent} busy={busy} onDelete={(options) => onDelete(deletingEvent, options)} /> : null}
    </>
  );
}
