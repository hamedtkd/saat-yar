"use client";

import { AlertTriangle, CalendarDays } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { summarizeCalendarWeek } from "@/lib/calendar-integration/intelligence";
import type { ExternalCalendarEvent } from "@/lib/calendar-integration/types";
import { cn } from "@/lib/cn";

export function CalendarWeekPlanner({ events, dateKeys, selectedDate, onSelectDate }: {
  events: ExternalCalendarEvent[];
  dateKeys: string[];
  selectedDate: string;
  onSelectDate?: (dateKey: string) => void;
}) {
  const { t, date, number, time } = useLocaleUi();
  const days = summarizeCalendarWeek(events, dateKeys);
  return (
    <div data-calendar-week-planner className="grid gap-2 md:grid-cols-7">
      {days.map((day) => {
        const preview = day.agenda.slice(0, 2);
        return <button key={day.dateKey} type="button" onClick={() => onSelectDate?.(day.dateKey)} className={cn("min-w-0 rounded-[14px] border bg-[var(--surface-2)] p-3 text-start transition-colors hover:border-[var(--accent)]", day.dateKey === selectedDate ? "border-[var(--accent)] ring-1 ring-[var(--accent-soft)]" : "border-[var(--dashboard-border)]")}>
          <span className="flex items-center justify-between gap-2"><strong className="text-[10px] text-[var(--text)]">{date(day.dateKey, { weekday: "short", day: "numeric" })}</strong><span className="text-[8px] font-bold text-[var(--text-muted)]">{number(day.eventCount)}</span></span>
          {day.conflictCount > 0 ? <span className="mt-2 flex items-center gap-1 text-[8px] font-bold text-[var(--warning)]"><AlertTriangle className="size-3" />{t("calendar.google.weekConflict", { count: number(day.conflictCount) })}</span> : null}
          <div className="mt-2 grid gap-1.5">{preview.length ? preview.map(({ event }) => <span key={`${event.calendarId}:${event.id}`} className="block truncate rounded-lg bg-[var(--surface-1)] px-2 py-1.5 text-[8px] text-[var(--text-muted)]"><span className="me-1 font-bold text-[var(--text)]">{event.allDay ? <CalendarDays className="inline size-3" /> : time(event.start)}</span>{event.title || t("calendar.google.busy")}</span>) : <span className="py-2 text-[8px] text-[var(--text-subtle)]">{t("calendar.google.weekEmpty")}</span>}</div>
          {day.duplicateCount > 0 ? <span className="mt-2 block text-[8px] text-[var(--accent-strong)]">{t("calendar.google.weekDuplicates", { count: number(day.duplicateCount) })}</span> : null}
        </button>;
      })}
    </div>
  );
}
