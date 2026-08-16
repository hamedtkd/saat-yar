import { eventOccursOnDate } from "./google-calendar.ts";
import type { ExternalCalendarEvent, ExternalCalendarRange } from "./types.ts";

export type CalendarAgendaItem = {
  event: ExternalCalendarEvent;
  duplicateCount: number;
  conflict: boolean;
};

function eventKey(event: ExternalCalendarEvent) {
  return `${event.calendarId}:${event.id}`;
}

function duplicateFingerprint(event: ExternalCalendarEvent) {
  const occurrence = event.originalStart ?? event.start;
  if (event.iCalUid) return `ical:${event.iCalUid}:${occurrence}`;
  return `fallback:${event.title.trim().toLowerCase()}:${event.start}:${event.end}:${event.location?.trim().toLowerCase() ?? ""}`;
}

function timedOverlap(left: ExternalCalendarEvent, right: ExternalCalendarEvent) {
  if (left.allDay || right.allDay) return false;
  const leftStart = new Date(left.start).getTime();
  const leftEnd = new Date(left.end).getTime();
  const rightStart = new Date(right.start).getTime();
  const rightEnd = new Date(right.end).getTime();
  if (![leftStart, leftEnd, rightStart, rightEnd].every(Number.isFinite)) return false;
  return leftStart < rightEnd && rightStart < leftEnd;
}

export function eventOccursInRange(event: ExternalCalendarEvent, range: ExternalCalendarRange) {
  return event.startDateKey < range.endDateKeyExclusive && event.endDateKey >= range.startDateKey;
}

export function buildCalendarDayAgenda(events: ExternalCalendarEvent[], dateKey: string): CalendarAgendaItem[] {
  const dayEvents = events.filter((event) => eventOccursOnDate(event, dateKey));
  const groups = new Map<string, ExternalCalendarEvent[]>();
  for (const event of dayEvents) {
    const fingerprint = duplicateFingerprint(event);
    groups.set(fingerprint, [...(groups.get(fingerprint) ?? []), event]);
  }
  const canonical = [...groups.values()].map((group) => [...group].sort((left, right) => eventKey(left).localeCompare(eventKey(right)))[0]);
  const conflictKeys = new Set<string>();
  for (let leftIndex = 0; leftIndex < canonical.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < canonical.length; rightIndex += 1) {
      const left = canonical[leftIndex];
      const right = canonical[rightIndex];
      if (!timedOverlap(left, right)) continue;
      conflictKeys.add(eventKey(left));
      conflictKeys.add(eventKey(right));
    }
  }
  return canonical
    .sort((left, right) => left.allDay === right.allDay ? left.start.localeCompare(right.start) : left.allDay ? -1 : 1)
    .map((event) => ({
      event,
      duplicateCount: groups.get(duplicateFingerprint(event))?.length ?? 1,
      conflict: conflictKeys.has(eventKey(event)),
    }));
}

export function summarizeCalendarWeek(events: ExternalCalendarEvent[], dateKeys: string[]) {
  return dateKeys.map((dateKey) => {
    const agenda = buildCalendarDayAgenda(events, dateKey);
    return {
      dateKey,
      agenda,
      eventCount: agenda.length,
      duplicateCount: agenda.reduce((sum, item) => sum + Math.max(0, item.duplicateCount - 1), 0),
      conflictCount: agenda.filter((item) => item.conflict).length,
    };
  });
}
