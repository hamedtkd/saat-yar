"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Columns3, List, LoaderCircle, Plus } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { SurfaceCard } from "@/components/common/surface-card";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import { addCalendarEventActivity } from "@/lib/calendar-integration/activity-import";
import { chooseWritableCalendar } from "@/lib/calendar-integration/draft";
import type { ExternalCalendarEvent } from "@/lib/calendar-integration/types";
import type { ActivityKind, AppData } from "@/lib/types";
import { useCalendarIntegration } from "./calendar-integration-provider";
import { CalendarEventDialog } from "./calendar-event-dialog";
import { CalendarEventList } from "./calendar-event-list";
import { CalendarWeekPlanner } from "./calendar-week-planner";

export function CalendarAgendaSurface({ dateKey, events, loading, compact = false, data, setData, setToast, weekDateKeys, onSelectDate }: {
  dateKey: string;
  events: ExternalCalendarEvent[];
  loading: boolean;
  compact?: boolean;
  data?: AppData;
  setData?: React.Dispatch<React.SetStateAction<AppData>>;
  setToast?: (message: string) => void;
  weekDateKeys?: string[];
  onSelectDate?: (dateKey: string) => void;
}) {
  const { t } = useLocaleUi();
  const integration = useCalendarIntegration();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ExternalCalendarEvent | undefined>();
  const [view, setView] = useState<"day" | "week">("day");
  const defaultCalendar = useMemo(() => chooseWritableCalendar(integration.calendars, integration.selectedCalendarIds, editingEvent?.calendarId), [editingEvent?.calendarId, integration.calendars, integration.selectedCalendarIds]);
  const canWrite = integration.state === "connected" && Boolean(defaultCalendar);
  const openCreate = () => { setEditingEvent(undefined); setDialogOpen(true); };
  const openEdit = (event: ExternalCalendarEvent) => { setEditingEvent(event); setDialogOpen(true); };
  const importActivity = (event: ExternalCalendarEvent, kind: ActivityKind) => {
    if (!setData) return;
    setData((current) => addCalendarEventActivity(current, event, kind));
    setToast?.(t("calendar.google.toast.activityImported"));
  };

  return <SurfaceCard as="section" data-external-calendar-agenda className={compact ? "mt-4 p-4" : "mb-5 p-5"}>
    <PanelHead icon={<CalendarDays />} title={t("calendar.google.agendaTitle")}>
      <div className="flex flex-wrap items-center gap-2">
        {weekDateKeys?.length === 7 ? <div className="flex rounded-xl border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-0.5"><Button type="button" variant={view === "day" ? "default" : "ghost"} size="sm" className="h-7 rounded-lg px-2 text-[8px]" onClick={() => setView("day")}><List className="size-3" />{t("calendar.google.viewDay")}</Button><Button type="button" variant={view === "week" ? "default" : "ghost"} size="sm" className="h-7 rounded-lg px-2 text-[8px]" onClick={() => setView("week")}><Columns3 className="size-3" />{t("calendar.google.viewWeek")}</Button></div> : null}
        <span className="rounded-full border border-[var(--dashboard-border)] bg-[var(--surface-2)] px-2.5 py-1 text-[8px] font-bold text-[var(--text-muted)]">{canWrite ? t("calendar.google.readWrite") : t("calendar.google.readOnly")}</span>
        {canWrite && <Button type="button" size="sm" className="h-8 rounded-xl px-2.5 text-[9px]" onClick={openCreate}><Plus className="size-3.5" /> {t("calendar.google.createEvent")}</Button>}
      </div>
    </PanelHead>
    <p className="mb-3 text-[9px] leading-5 text-[var(--text-muted)]">{t("calendar.google.agendaDescription")}</p>
    {loading ? <div data-calendar-loading className="flex min-h-20 items-center justify-center gap-2 text-[10px] text-[var(--text-muted)]"><LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" /> {t("calendar.google.loading")}</div>
      : view === "week" && weekDateKeys?.length === 7
        ? <CalendarWeekPlanner events={events} dateKeys={weekDateKeys} selectedDate={dateKey} onSelectDate={onSelectDate} />
        : <CalendarEventList events={events} dateKey={dateKey} onEdit={openEdit} onDelete={integration.deleteEvent} busy={integration.mutating} data={data} onConvertActivity={setData ? importActivity : undefined} />}
    {defaultCalendar && <CalendarEventDialog open={dialogOpen} onOpenChange={setDialogOpen} dateKey={dateKey} defaultCalendarId={defaultCalendar.id} calendars={integration.calendars} event={editingEvent} busy={integration.mutating} onCreate={integration.createEvent} onUpdate={integration.updateEvent} onDelete={integration.deleteEvent} />}
  </SurfaceCard>;
}
