import { emptyRecord, localDateKey } from "../format.ts";
import { normalizeActivityTitle } from "../activity-segments.ts";
import type { ActivityKind, AppData, ActivitySegment } from "../types.ts";
import type { ExternalCalendarEvent } from "./types.ts";

export function externalCalendarActivityId(event: ExternalCalendarEvent) {
  if (event.iCalUid) {
    const occurrence = event.originalStart ?? event.start;
    return `gcal:${encodeURIComponent(event.iCalUid)}:${encodeURIComponent(occurrence)}`;
  }
  return `gcal:${encodeURIComponent(event.calendarId)}:${event.id}`;
}

function localTime(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function defaultActivityKindForCalendarEvent(event: ExternalCalendarEvent): ActivityKind {
  if (event.kind === "focus") return "deep-work";
  if (event.kind === "meeting") return "meeting";
  return "other";
}

export function canConvertCalendarEventToActivity(event: ExternalCalendarEvent) {
  if (event.allDay || event.kind === "availability" || event.startDateKey !== event.endDateKey) return false;
  const start = localTime(event.start);
  const end = localTime(event.end);
  return Boolean(start && end && end > start && localDateKey(new Date(event.start)) === event.startDateKey);
}

export function hasConvertedCalendarEvent(data: AppData, event: ExternalCalendarEvent) {
  const record = data.records[event.startDateKey];
  const id = externalCalendarActivityId(event);
  return Boolean(record?.activitySegments.some((segment) => segment.id === id));
}

export function calendarEventToActivitySegment(event: ExternalCalendarEvent, kind: ActivityKind): ActivitySegment {
  if (!canConvertCalendarEventToActivity(event)) throw new Error("Calendar event cannot be converted to an activity segment.");
  return {
    id: externalCalendarActivityId(event),
    kind,
    title: normalizeActivityTitle(event.title),
    start: localTime(event.start),
    end: localTime(event.end),
    startedAt: event.start,
    endedAt: event.end,
  };
}

export function addCalendarEventActivity(data: AppData, event: ExternalCalendarEvent, kind: ActivityKind): AppData {
  if (hasConvertedCalendarEvent(data, event)) return data;
  const record = data.records[event.startDateKey] ?? emptyRecord(event.startDateKey, data.settings);
  const segment = calendarEventToActivitySegment(event, kind);
  return {
    ...data,
    records: {
      ...data.records,
      [event.startDateKey]: { ...record, activitySegments: [...record.activitySegments, segment], updatedAt: new Date().toISOString() },
    },
  };
}
