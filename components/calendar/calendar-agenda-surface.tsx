"use client";

import { useMemo, useState } from "react";
import { CalendarDays, LoaderCircle, Plus } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { SurfaceCard } from "@/components/common/surface-card";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import { chooseWritableCalendar } from "@/lib/calendar-integration/draft";
import type { ExternalCalendarEvent } from "@/lib/calendar-integration/types";
import { useCalendarIntegration } from "./calendar-integration-provider";
import { CalendarEventDialog } from "./calendar-event-dialog";
import { CalendarEventList } from "./calendar-event-list";

export function CalendarAgendaSurface({ dateKey, events, loading, compact = false }: {
  dateKey: string;
  events: ExternalCalendarEvent[];
  loading: boolean;
  compact?: boolean;
}) {
  const { t } = useLocaleUi();
  const integration = useCalendarIntegration();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ExternalCalendarEvent | undefined>();
  const defaultCalendar = useMemo(() => chooseWritableCalendar(integration.calendars, integration.selectedCalendarIds, editingEvent?.calendarId), [editingEvent?.calendarId, integration.calendars, integration.selectedCalendarIds]);
  const canWrite = integration.state === "connected" && Boolean(defaultCalendar);
  const openCreate = () => { setEditingEvent(undefined); setDialogOpen(true); };
  const openEdit = (event: ExternalCalendarEvent) => { setEditingEvent(event); setDialogOpen(true); };

  return (
    <SurfaceCard as="section" data-external-calendar-agenda className={compact ? "mt-4 p-4" : "mb-5 p-5"}>
      <PanelHead icon={<CalendarDays />} title={t("calendar.google.agendaTitle")}>
        <div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-[var(--dashboard-border)] bg-[var(--surface-2)] px-2.5 py-1 text-[8px] font-bold text-[var(--text-muted)]">{canWrite ? t("calendar.google.readWrite") : t("calendar.google.readOnly")}</span>{canWrite && <Button type="button" size="sm" className="h-8 rounded-xl px-2.5 text-[9px]" onClick={openCreate}><Plus className="size-3.5" /> {t("calendar.google.createEvent")}</Button>}</div>
      </PanelHead>
      <p className="mb-3 text-[9px] leading-5 text-[var(--text-muted)]">{t("calendar.google.agendaDescription")}</p>
      {loading ? (
        <div data-calendar-loading className="flex min-h-20 items-center justify-center gap-2 text-[10px] text-[var(--text-muted)]"><LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" /> {t("calendar.google.loading")}</div>
      ) : <CalendarEventList events={events} dateKey={dateKey} onEdit={openEdit} onDelete={integration.deleteEvent} busy={integration.mutating} />}
      {defaultCalendar && <CalendarEventDialog open={dialogOpen} onOpenChange={setDialogOpen} dateKey={dateKey} defaultCalendarId={defaultCalendar.id} calendars={integration.calendars} event={editingEvent} busy={integration.mutating} onCreate={integration.createEvent} onUpdate={integration.updateEvent} onDelete={integration.deleteEvent} />}
    </SurfaceCard>
  );
}
