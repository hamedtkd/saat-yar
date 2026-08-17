import {
  GOOGLE_CALENDAR_API_ROOT,
  fetchGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  GoogleCalendarApiError,
  type GoogleEventDate,
  type GoogleEventItem,
} from "./google-calendar.ts";
import type { ExternalCalendarEvent, ExternalCalendarEventDraft } from "./types.ts";

function dateTimeWithTime(source: GoogleEventDate | undefined, time: string, fallbackTimeZone: string) {
  if (!source?.dateTime) return undefined;
  const date = source.dateTime.slice(0, 10);
  return { dateTime: `${date}T${time}:00`, timeZone: source.timeZone ?? fallbackTimeZone };
}

function buildSeriesPatch(parent: GoogleEventItem, draft: ExternalCalendarEventDraft, timeZone: string) {
  const description = draft.description.trim();
  const location = draft.location.trim();
  const start = dateTimeWithTime(parent.start, draft.startTime, timeZone);
  const end = dateTimeWithTime(parent.end, draft.endTime, timeZone);
  return {
    summary: draft.title.trim(),
    description,
    location,
    ...(start && end ? { start, end } : {}),
  };
}

export async function updateGoogleCalendarSeries(
  accessToken: string,
  event: ExternalCalendarEvent,
  draft: ExternalCalendarEventDraft,
  timeZone: string,
  fetcher: typeof fetch = fetch,
) {
  if (!event.recurringEventId) throw new GoogleCalendarApiError(400);
  const parent = await fetchGoogleCalendarEvent(accessToken, event.calendarId, event.recurringEventId, fetcher);
  const params = new URLSearchParams({ sendUpdates: draft.notifyAttendees ? "all" : "none" });
  const response = await fetcher(
    `${GOOGLE_CALENDAR_API_ROOT}/calendars/${encodeURIComponent(event.calendarId)}/events/${encodeURIComponent(event.recurringEventId)}?${params}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...(parent.etag ? { "If-Match": parent.etag } : {}),
      },
      body: JSON.stringify(buildSeriesPatch(parent, draft, timeZone)),
    },
  );
  if (!response.ok) throw new GoogleCalendarApiError(response.status);
  return response.json() as Promise<GoogleEventItem>;
}

export async function deleteGoogleCalendarSeries(
  accessToken: string,
  event: ExternalCalendarEvent,
  notifyAttendees = true,
  fetcher: typeof fetch = fetch,
) {
  if (!event.recurringEventId) throw new GoogleCalendarApiError(400);
  const parent = await fetchGoogleCalendarEvent(accessToken, event.calendarId, event.recurringEventId, fetcher);
  await deleteGoogleCalendarEvent(accessToken, event.calendarId, event.recurringEventId, notifyAttendees, fetcher, parent.etag);
}
