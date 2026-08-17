import { GOOGLE_CALENDAR_API_ROOT, GoogleCalendarApiError, normalizeGoogleEvent, type GoogleEventItem } from "./google-calendar.ts";
import { deleteGoogleCalendarSyncCache, readGoogleCalendarSyncCache, writeGoogleCalendarSyncCache, type GoogleCalendarSyncCacheEntry } from "./sync-cache.ts";
import type { ExternalCalendarEvent, ExternalCalendarSource, ExternalCalendarSyncMode } from "./types.ts";

type GoogleEventsSyncResponse = {
  items?: GoogleEventItem[];
  nextPageToken?: string;
  nextSyncToken?: string;
};

export type GoogleCalendarSyncResult = {
  events: ExternalCalendarEvent[];
  mode: ExternalCalendarSyncMode;
  syncedAt: string;
};

export type GoogleCalendarSyncCacheAdapter = {
  read: (calendarId: string) => Promise<GoogleCalendarSyncCacheEntry | null>;
  write: (entry: GoogleCalendarSyncCacheEntry) => Promise<void>;
  remove: (calendarId: string) => Promise<void>;
};

const browserSyncCache: GoogleCalendarSyncCacheAdapter = {
  read: readGoogleCalendarSyncCache,
  write: writeGoogleCalendarSyncCache,
  remove: deleteGoogleCalendarSyncCache,
};

function initialTimeMin(now = new Date()) {
  const threshold = new Date(now);
  threshold.setFullYear(threshold.getFullYear() - 1);
  return threshold.toISOString();
}

export function buildGoogleSyncEventsUrl(calendarId: string, timeZone: string, options: {
  syncToken?: string;
  pageToken?: string;
  now?: Date;
}) {
  const params = new URLSearchParams({
    singleEvents: "true",
    showDeleted: "true",
    maxResults: "2500",
    timeZone,
  });
  if (options.syncToken) params.set("syncToken", options.syncToken);
  else params.set("timeMin", initialTimeMin(options.now));
  if (options.pageToken) params.set("pageToken", options.pageToken);
  return `${GOOGLE_CALENDAR_API_ROOT}/calendars/${encodeURIComponent(calendarId)}/events?${params}`;
}

async function fetchSyncPage(url: string, accessToken: string, fetcher: typeof fetch) {
  const response = await fetcher(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new GoogleCalendarApiError(response.status);
  return response.json() as Promise<GoogleEventsSyncResponse>;
}

function rebindEvent(event: ExternalCalendarEvent, calendar: ExternalCalendarSource): ExternalCalendarEvent {
  return {
    ...event,
    calendarId: calendar.id,
    calendarName: calendar.name,
    calendarColor: calendar.color,
    editable: calendar.writable && event.kind === "meeting",
  };
}

async function runSync(accessToken: string, calendar: ExternalCalendarSource, timeZone: string, fetcher: typeof fetch, cacheAdapter: GoogleCalendarSyncCacheAdapter, syncToken?: string) {
  const cache = syncToken ? await cacheAdapter.read(calendar.id) : null;
  const byId = new Map((cache?.events ?? []).map((event) => [event.id, rebindEvent(event, calendar)]));
  let pageToken = "";
  let nextSyncToken = "";
  do {
    const response = await fetchSyncPage(buildGoogleSyncEventsUrl(calendar.id, timeZone, {
      syncToken,
      pageToken: pageToken || undefined,
    }), accessToken, fetcher);
    for (const item of response.items ?? []) {
      if (!item.id) continue;
      if (item.status === "cancelled") {
        byId.delete(item.id);
        continue;
      }
      const event = normalizeGoogleEvent(item, calendar);
      if (event) byId.set(item.id, event);
    }
    pageToken = response.nextPageToken ?? "";
    if (response.nextSyncToken) nextSyncToken = response.nextSyncToken;
  } while (pageToken);
  if (!nextSyncToken) throw new Error("Google Calendar sync response did not include nextSyncToken.");
  const syncedAt = new Date().toISOString();
  const events = [...byId.values()];
  await cacheAdapter.write({ version: 1, calendarId: calendar.id, syncToken: nextSyncToken, events, updatedAt: syncedAt });
  return { events, syncedAt };
}

export async function syncGoogleCalendarEvents(
  accessToken: string,
  calendar: ExternalCalendarSource,
  timeZone: string,
  fetcher: typeof fetch = fetch,
  cacheAdapter: GoogleCalendarSyncCacheAdapter = browserSyncCache,
): Promise<GoogleCalendarSyncResult> {
  const cached = await cacheAdapter.read(calendar.id);
  if (cached?.syncToken) {
    try {
      const result = await runSync(accessToken, calendar, timeZone, fetcher, cacheAdapter, cached.syncToken);
      return { ...result, mode: "incremental" };
    } catch (error) {
      if (!(error instanceof GoogleCalendarApiError) || error.status !== 410) throw error;
      await cacheAdapter.remove(calendar.id);
    }
  }
  const result = await runSync(accessToken, calendar, timeZone, fetcher, cacheAdapter);
  return { ...result, mode: "full" };
}

export async function syncSelectedGoogleCalendars(accessToken: string, calendars: ExternalCalendarSource[], timeZone: string) {
  const results = await Promise.all(calendars.map((calendar) => syncGoogleCalendarEvents(accessToken, calendar, timeZone)));
  const mode: ExternalCalendarSyncMode = results.some((result) => result.mode === "full") ? "full" : "incremental";
  const syncedAt = results.reduce((latest, result) => result.syncedAt > latest ? result.syncedAt : latest, "");
  return { mode, syncedAt, events: results.flatMap((result) => result.events) };
}
