"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { BriefcaseBusiness, CalendarPlus2, CalendarX2, Pencil, RotateCcw, Settings2, Trash2 } from "lucide-react";
import { CalendarEventDeleteDialog } from "@/components/calendar/calendar-event-delete-dialog";
import { CalendarEventDialog } from "@/components/calendar/calendar-event-dialog";
import { useCalendarIntegration } from "@/components/calendar/calendar-integration-provider";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import { chooseWritableCalendar } from "@/lib/calendar-integration/draft";
import { eventOccursOnDate } from "@/lib/calendar-integration/google-calendar";
import type { ExternalCalendarEvent } from "@/lib/calendar-integration/types";
import { getHolidayInfo } from "@/lib/holidays";
import { normalizeHolidayOverrides } from "@/lib/holiday-overrides";
import type { AppData } from "@/lib/types";

export type MonthDayMenuAnchor = { dateKey: string; x: number; y: number };

type Props = {
  anchor: MonthDayMenuAnchor | null;
  onClose: () => void;
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setToast: (message: string) => void;
  externalEvents: ExternalCalendarEvent[];
};

export function MonthDayQuickMenu({ anchor, onClose, data, setData, setToast, externalEvents }: Props) {
  const { t, date } = useLocaleUi();
  const integration = useCalendarIntegration();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDateKey, setDialogDateKey] = useState("");
  const [editingEvent, setEditingEvent] = useState<ExternalCalendarEvent | undefined>();
  const [deletingEvent, setDeletingEvent] = useState<ExternalCalendarEvent | null>(null);
  const dateKey = anchor?.dateKey ?? "";
  const events = useMemo(() => externalEvents.filter((event) => dateKey && eventOccursOnDate(event, dateKey)), [dateKey, externalEvents]);
  const defaultCalendar = useMemo(() => chooseWritableCalendar(integration.calendars, integration.selectedCalendarIds, editingEvent?.calendarId), [editingEvent?.calendarId, integration.calendars, integration.selectedCalendarIds]);
  const override = data.holidayOverrides.find((item) => item.date === dateKey);
  const record = data.records[dateKey];
  const holiday = dateKey ? getHolidayInfo(dateKey, { mode: data.settings.mode, manualHoliday: record?.holiday, includeOfficialHolidays: data.settings.autoOfficialHolidays, includeWeeklyHoliday: data.settings.autoWeeklyHoliday, overrides: data.holidayOverrides }) : { isHoliday: false };

  useEffect(() => {
    if (!anchor) return;
    const close = () => onClose();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [anchor, onClose]);

  const setHolidayState = (isHoliday: boolean) => {
    if (!dateKey) return;
    setData((previous) => {
      const existing = previous.holidayOverrides.find((item) => item.date === dateKey);
      const next = previous.holidayOverrides.filter((item) => item.date !== dateKey);
      next.push({ id: existing?.id ?? crypto.randomUUID(), date: dateKey, title: isHoliday ? t("month.dayActions.manualHolidayTitle") : t("month.dayActions.manualWorkdayTitle"), kind: "manual", isHoliday });
      return { ...previous, holidayOverrides: normalizeHolidayOverrides(next) };
    });
    setToast(isHoliday ? t("month.dayActions.holidaySaved") : t("month.dayActions.workdaySaved"));
    onClose();
  };

  const resetHolidayRule = () => {
    if (!dateKey) return;
    setData((previous) => ({ ...previous, holidayOverrides: previous.holidayOverrides.filter((item) => item.date !== dateKey) }));
    setToast(t("month.dayActions.holidayReset"));
    onClose();
  };

  const openCreate = () => { setDialogDateKey(dateKey); setEditingEvent(undefined); setDialogOpen(true); onClose(); };
  const openEdit = (event: ExternalCalendarEvent) => { setDialogDateKey(dateKey); setEditingEvent(event); setDialogOpen(true); onClose(); };
  const openDetails = () => { onClose(); requestAnimationFrame(() => document.getElementById("month-selected-day-section")?.scrollIntoView({ behavior: "smooth", block: "start" })); };

  const menu = anchor && typeof document !== "undefined" ? createPortal(<>
    <button type="button" aria-label={t("common.cancel")} className="fixed inset-0 z-[1180] cursor-default bg-transparent" onClick={onClose} onContextMenu={(event) => { event.preventDefault(); onClose(); }} />
    <div role="menu" aria-label={t("month.dayActions.menuAria")} data-month-day-quick-menu className="fixed z-[1190] max-h-[calc(100dvh-16px)] w-[min(310px,calc(100vw-16px))] overflow-y-auto rounded-[18px] border border-[var(--dashboard-border)] bg-[var(--surface-glass)] p-2 shadow-[0_18px_48px_rgba(0,0,0,.22)] backdrop-blur-2xl" style={{ left: Math.max(8, Math.min(anchor.x, window.innerWidth - 318)), top: Math.max(8, Math.min(anchor.y, window.innerHeight - 420)) }}>
      <div className="mb-1 rounded-[14px] bg-[var(--surface-2)] px-3 py-2.5"><strong className="block text-[11px] text-[var(--text)]">{t("month.dayActions.title")}</strong><span className="mt-0.5 block text-[9px] text-[var(--text-muted)]">{date(dateKey, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span></div>
      <div className="grid gap-1">
        <MenuButton icon={<Settings2 />} label={t("month.dayActions.details")} onClick={openDetails} />
        {integration.state === "connected" && defaultCalendar ? <MenuButton icon={<CalendarPlus2 />} label={t("calendar.google.createForSelectedDay")} onClick={openCreate} /> : integration.state !== "unconfigured" ? <MenuButton icon={<CalendarPlus2 />} label={t("calendar.google.connect")} onClick={() => { onClose(); void integration.connect(); }} /> : null}
        <MenuButton icon={holiday.isHoliday ? <BriefcaseBusiness /> : <CalendarX2 />} label={holiday.isHoliday ? t("month.dayActions.markWorkday") : t("month.dayActions.markHoliday")} onClick={() => setHolidayState(!holiday.isHoliday)} />
        {override && <MenuButton icon={<RotateCcw />} label={t("month.dayActions.resetHoliday")} onClick={resetHolidayRule} />}
      </div>
      {events.length > 0 && <div className="mt-2 border-t border-[var(--dashboard-border)] pt-2"><span className="px-2 text-[8px] font-black text-[var(--text-muted)]">{t("calendar.google.agendaTitle")}</span><div className="mt-1 grid gap-1">{events.slice(0, 4).map((event) => <div key={`${event.calendarId}:${event.id}`} className="flex items-center gap-2 rounded-xl bg-[var(--surface-2)] px-2 py-1.5"><span className="min-w-0 flex-1 truncate text-[9px] font-bold text-[var(--text)]">{event.title || t("calendar.google.busy")}</span>{event.editable && <Button type="button" variant="ghost" size="icon" className="size-7 rounded-lg" onClick={() => openEdit(event)} aria-label={t("calendar.google.editEvent")}><Pencil className="size-3.5" /></Button>}{event.editable && <Button type="button" variant="ghost" size="icon" className="size-7 rounded-lg text-[var(--danger)]" onClick={() => { setDeletingEvent(event); onClose(); }} aria-label={t("calendar.google.quickDelete")}><Trash2 className="size-3.5" /></Button>}</div>)}</div></div>}
    </div>
  </>, document.body) : null;

  return <>{menu}{defaultCalendar && <CalendarEventDialog open={dialogOpen} onOpenChange={setDialogOpen} dateKey={dialogDateKey || dateKey} defaultCalendarId={defaultCalendar.id} calendars={integration.calendars} event={editingEvent} busy={integration.mutating} onCreate={integration.createEvent} onUpdate={integration.updateEvent} onDelete={integration.deleteEvent} />}{deletingEvent && <CalendarEventDeleteDialog open onOpenChange={(open) => { if (!open) setDeletingEvent(null); }} event={deletingEvent} busy={integration.mutating} onDelete={(options) => integration.deleteEvent(deletingEvent, options)} />}</>;
}

function MenuButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button type="button" role="menuitem" onClick={onClick} className="flex min-h-10 w-full items-center gap-2.5 rounded-xl px-2.5 text-start text-[10px] font-bold text-[var(--text)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"><span className="grid size-7 place-items-center rounded-[9px] bg-[var(--surface-2)] text-[var(--accent-strong)] [&_svg]:size-4">{icon}</span><span className="min-w-0 flex-1 truncate">{label}</span></button>;
}
