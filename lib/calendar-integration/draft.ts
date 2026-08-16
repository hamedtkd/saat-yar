import { localDateKey } from "../format.ts";
import type { ExternalCalendarEvent, ExternalCalendarEventDraft, ExternalCalendarSource } from "./types.ts";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function localTime(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "09:00";
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function roundedStartTime(dateKey: string) {
  const now = new Date();
  if (dateKey !== localDateKey(now)) return "09:00";
  const minutes = now.getMinutes();
  const rounded = minutes === 0 ? 0 : minutes <= 30 ? 30 : 60;
  const next = new Date(now);
  next.setSeconds(0, 0);
  if (rounded === 60) {
    next.setHours(next.getHours() + 1, 0, 0, 0);
  } else {
    next.setMinutes(rounded, 0, 0);
  }
  return `${pad(next.getHours())}:${pad(next.getMinutes())}`;
}

function addMinutes(time: string, minutes: number) {
  const [hours, mins] = time.split(":").map(Number);
  const total = Math.max(0, (hours * 60 + mins + minutes) % (24 * 60));
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

export function chooseWritableCalendar(calendars: ExternalCalendarSource[], selectedIds: string[], preferredId?: string) {
  const preferred = calendars.find((calendar) => calendar.id === preferredId && calendar.writable);
  if (preferred) return preferred;
  return calendars.find((calendar) => selectedIds.includes(calendar.id) && calendar.writable);
}

export function createExternalCalendarDraft(dateKey: string, calendarId: string): ExternalCalendarEventDraft {
  const startTime = roundedStartTime(dateKey);
  return {
    calendarId,
    title: "",
    description: "",
    location: "",
    allDay: false,
    startDateKey: dateKey,
    endDateKey: dateKey,
    startTime,
    endTime: addMinutes(startTime, 60),
    repeat: "none",
    notifyAttendees: true,
  };
}

export function draftFromExternalCalendarEvent(event: ExternalCalendarEvent): ExternalCalendarEventDraft {
  return {
    calendarId: event.calendarId,
    title: event.title,
    description: event.description ?? "",
    location: event.location ?? "",
    allDay: event.allDay,
    startDateKey: event.startDateKey,
    endDateKey: event.endDateKey,
    startTime: event.allDay ? "09:00" : localTime(event.start),
    endTime: event.allDay ? "10:00" : localTime(event.end),
    repeat: "none",
    notifyAttendees: true,
  };
}

export type CalendarDraftError = "title" | "calendar" | "date" | "time" | null;

export function validateExternalCalendarDraft(draft: ExternalCalendarEventDraft): CalendarDraftError {
  if (!draft.calendarId) return "calendar";
  if (!draft.title.trim()) return "title";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.startDateKey) || !/^\d{4}-\d{2}-\d{2}$/.test(draft.endDateKey) || draft.endDateKey < draft.startDateKey) return "date";
  if (draft.allDay) return null;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.startTime) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.endTime)) return "time";
  if (draft.startDateKey === draft.endDateKey && draft.endTime <= draft.startTime) return "time";
  return null;
}
