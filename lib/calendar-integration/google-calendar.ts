import { localDateKey, shiftDateKey } from "../format.ts";
import type {
  ExternalCalendarEvent,
  ExternalCalendarEventDraft,
  ExternalCalendarRange,
  ExternalCalendarSource,
} from "./types.ts";

export const GOOGLE_CALENDAR_LIST_SCOPE = "https://www.googleapis.com/auth/calendar.calendarlist.readonly";
export const GOOGLE_CALENDAR_EVENTS_SCOPE = "https://www.googleapis.com/auth/calendar.events";
export const GOOGLE_CALENDAR_SCOPES = [GOOGLE_CALENDAR_LIST_SCOPE, GOOGLE_CALENDAR_EVENTS_SCOPE] as const;
export const GOOGLE_CALENDAR_SCOPE = GOOGLE_CALENDAR_SCOPES.join(" ");
export const GOOGLE_CALENDAR_API_ROOT = "https://www.googleapis.com/calendar/v3";

export type GoogleCalendarConfig = {
  configured: boolean;
  clientId: string;
};

type GoogleCalendarListItem = {
  id?: string;
  summary?: string;
  primary?: boolean;
  backgroundColor?: string;
  accessRole?: string;
};

type GoogleCalendarListResponse = {
  items?: GoogleCalendarListItem[];
  nextPageToken?: string;
};

export type GoogleEventDate = { date?: string; dateTime?: string; timeZone?: string };
export type GoogleEventItem = {
  id?: string;
  summary?: string;
  description?: string;
  location?: string;
  status?: string;
  eventType?: string;
  htmlLink?: string;
  recurringEventId?: string;
  originalStartTime?: GoogleEventDate;
  iCalUID?: string;
  etag?: string;
  updated?: string;
  recurrence?: string[];
  start?: GoogleEventDate;
  end?: GoogleEventDate;
};

type GoogleEventsResponse = {
  items?: GoogleEventItem[];
  nextPageToken?: string;
};

export class GoogleCalendarApiError extends Error {
  status: number;
  constructor(status: number) {
    super(`Google Calendar API request failed with status ${status}.`);
    this.name = "GoogleCalendarApiError";
    this.status = status;
  }
}

export function resolveGoogleCalendarConfig(env?: Record<string, string | undefined>): GoogleCalendarConfig {
  const rawClientId = env
    ? env.NEXT_PUBLIC_GOOGLE_CALENDAR_CLIENT_ID
    : process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_CLIENT_ID;
  const clientId = rawClientId?.trim() ?? "";
  return { configured: clientId.length > 0, clientId };
}

export function mapGoogleEventKind(eventType?: string): ExternalCalendarEvent["kind"] {
  if (eventType === "focusTime") return "focus";
  if (eventType === "outOfOffice" || eventType === "workingLocation") return "availability";
  if (eventType === "default") return "meeting";
  return "activity";
}

export function googleCalendarRoleCanWrite(accessRole?: string) {
  return accessRole === "writer" || accessRole === "owner";
}

function timedEndDateKey(value: string) {
  const end = new Date(value).getTime();
  if (!Number.isFinite(end)) return localDateKey(new Date(value));
  return localDateKey(new Date(Math.max(0, end - 1)));
}

export function normalizeGoogleEvent(
  item: GoogleEventItem,
  calendar: ExternalCalendarSource,
): ExternalCalendarEvent | null {
  if (!item.id || item.status === "cancelled" || !item.start || !item.end) return null;
  const allDay = Boolean(item.start.date && item.end.date);
  const start = item.start.date ?? item.start.dateTime;
  const end = item.end.date ?? item.end.dateTime;
  if (!start || !end) return null;
  const startDateKey = allDay ? start : localDateKey(new Date(start));
  const endDateKey = allDay ? shiftDateKey(end, -1) : timedEndDateKey(end);
  const eventType = item.eventType ?? "default";
  return {
    provider: "google",
    calendarId: calendar.id,
    calendarName: calendar.name,
    calendarColor: calendar.color,
    id: item.id,
    title: item.summary?.trim() ?? "",
    kind: mapGoogleEventKind(eventType),
    allDay,
    start,
    end,
    startDateKey,
    endDateKey,
    htmlLink: item.htmlLink,
    description: item.description,
    location: item.location,
    recurringEventId: item.recurringEventId,
    originalStart: item.originalStartTime?.dateTime ?? item.originalStartTime?.date,
    iCalUid: item.iCalUID,
    etag: item.etag,
    updatedAt: item.updated,
    editable: calendar.writable && eventType === "default",
  };
}

export function eventOccursOnDate(event: ExternalCalendarEvent, dateKey: string) {
  return event.startDateKey <= dateKey && event.endDateKey >= dateKey;
}

export function buildGoogleEventsUrl(calendarId: string, range: ExternalCalendarRange, timeZone: string, pageToken?: string) {
  const params = new URLSearchParams({
    timeMin: new Date(`${range.startDateKey}T00:00:00`).toISOString(),
    timeMax: new Date(`${range.endDateKeyExclusive}T00:00:00`).toISOString(),
    timeZone,
    singleEvents: "true",
    orderBy: "startTime",
    showDeleted: "false",
    maxResults: "2500",
  });
  if (pageToken) params.set("pageToken", pageToken);
  return `${GOOGLE_CALENDAR_API_ROOT}/calendars/${encodeURIComponent(calendarId)}/events?${params}`;
}

async function fetchJson<T>(url: string, accessToken: string, fetcher: typeof fetch, init?: RequestInit): Promise<T> {
  const response = await fetcher(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) throw new GoogleCalendarApiError(response.status);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function fetchGoogleCalendars(accessToken: string, fetcher: typeof fetch = fetch) {
  const calendars: ExternalCalendarSource[] = [];
  let pageToken = "";
  do {
    const params = new URLSearchParams({ maxResults: "250", minAccessRole: "reader" });
    if (pageToken) params.set("pageToken", pageToken);
    const response = await fetchJson<GoogleCalendarListResponse>(`${GOOGLE_CALENDAR_API_ROOT}/users/me/calendarList?${params}`, accessToken, fetcher);
    for (const item of response.items ?? []) {
      if (!item.id) continue;
      calendars.push({
        provider: "google",
        id: item.id,
        name: item.summary?.trim() || item.id,
        primary: Boolean(item.primary),
        color: item.backgroundColor,
        accessRole: item.accessRole ?? "reader",
        writable: googleCalendarRoleCanWrite(item.accessRole),
      });
    }
    pageToken = response.nextPageToken ?? "";
  } while (pageToken);
  return calendars;
}

export async function fetchGoogleCalendarEvents(
  accessToken: string,
  calendars: ExternalCalendarSource[],
  range: ExternalCalendarRange,
  timeZone: string,
  fetcher: typeof fetch = fetch,
) {
  const results = await Promise.all(calendars.map(async (calendar) => {
    const events: ExternalCalendarEvent[] = [];
    let pageToken = "";
    do {
      const response = await fetchJson<GoogleEventsResponse>(
        buildGoogleEventsUrl(calendar.id, range, timeZone, pageToken || undefined),
        accessToken,
        fetcher,
      );
      for (const item of response.items ?? []) {
        const event = normalizeGoogleEvent(item, calendar);
        if (event) events.push(event);
      }
      pageToken = response.nextPageToken ?? "";
    } while (pageToken);
    return events;
  }));
  return results.flat().sort((left, right) => {
    if (left.allDay !== right.allDay) return left.allDay ? -1 : 1;
    return left.start.localeCompare(right.start);
  });
}

function repeatRule(repeat: ExternalCalendarEventDraft["repeat"]) {
  if (repeat === "daily") return "RRULE:FREQ=DAILY";
  if (repeat === "weekly") return "RRULE:FREQ=WEEKLY";
  if (repeat === "monthly") return "RRULE:FREQ=MONTHLY";
  return undefined;
}

export function buildGoogleEventBody(draft: ExternalCalendarEventDraft, timeZone: string) {
  const summary = draft.title.trim();
  const description = draft.description.trim();
  const location = draft.location.trim();
  const common = {
    summary,
    ...(description ? { description } : {}),
    ...(location ? { location } : {}),
  };
  const recurrence = repeatRule(draft.repeat);
  if (draft.allDay) {
    return {
      ...common,
      start: { date: draft.startDateKey },
      end: { date: shiftDateKey(draft.endDateKey, 1) },
      ...(recurrence ? { recurrence: [recurrence] } : {}),
    };
  }
  return {
    ...common,
    start: { dateTime: `${draft.startDateKey}T${draft.startTime}:00`, timeZone },
    end: { dateTime: `${draft.endDateKey}T${draft.endTime}:00`, timeZone },
    ...(recurrence ? { recurrence: [recurrence] } : {}),
  };
}

export async function createGoogleCalendarEvent(
  accessToken: string,
  draft: ExternalCalendarEventDraft,
  timeZone: string,
  fetcher: typeof fetch = fetch,
) {
  const params = new URLSearchParams({ sendUpdates: draft.notifyAttendees ? "all" : "none" });
  return fetchJson<GoogleEventItem>(
    `${GOOGLE_CALENDAR_API_ROOT}/calendars/${encodeURIComponent(draft.calendarId)}/events?${params}`,
    accessToken,
    fetcher,
    { method: "POST", body: JSON.stringify(buildGoogleEventBody(draft, timeZone)) },
  );
}

export async function updateGoogleCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  draft: ExternalCalendarEventDraft,
  timeZone: string,
  fetcher: typeof fetch = fetch,
  ifMatch?: string,
) {
  const params = new URLSearchParams({ sendUpdates: draft.notifyAttendees ? "all" : "none" });
  return fetchJson<GoogleEventItem>(
    `${GOOGLE_CALENDAR_API_ROOT}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?${params}`,
    accessToken,
    fetcher,
    { method: "PATCH", body: JSON.stringify(buildGoogleEventBody({ ...draft, repeat: "none" }, timeZone)), headers: ifMatch ? { "If-Match": ifMatch } : undefined },
  );
}

export async function deleteGoogleCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  notifyAttendees = true,
  fetcher: typeof fetch = fetch,
  ifMatch?: string,
) {
  const params = new URLSearchParams({ sendUpdates: notifyAttendees ? "all" : "none" });
  await fetchJson<void>(
    `${GOOGLE_CALENDAR_API_ROOT}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?${params}`,
    accessToken,
    fetcher,
    { method: "DELETE", headers: ifMatch ? { "If-Match": ifMatch } : undefined },
  );
}

export async function fetchGoogleCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  fetcher: typeof fetch = fetch,
) {
  return fetchJson<GoogleEventItem>(
    `${GOOGLE_CALENDAR_API_ROOT}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    accessToken,
    fetcher,
  );
}
