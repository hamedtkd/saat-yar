import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { addCalendarEventActivity, canConvertCalendarEventToActivity, externalCalendarActivityId } from "../lib/calendar-integration/activity-import.ts";
import { deleteGoogleCalendarEvent, updateGoogleCalendarEvent } from "../lib/calendar-integration/google-calendar.ts";
import { updateGoogleCalendarSeries } from "../lib/calendar-integration/google-calendar-series.ts";
import { buildGoogleSyncEventsUrl, syncGoogleCalendarEvents, type GoogleCalendarSyncCacheAdapter } from "../lib/calendar-integration/google-calendar-sync.ts";
import { buildCalendarDayAgenda, summarizeCalendarWeek } from "../lib/calendar-integration/intelligence.ts";
import type { ExternalCalendarEvent, ExternalCalendarEventDraft, ExternalCalendarSource } from "../lib/calendar-integration/types.ts";
import { createInitialData } from "../lib/constants.ts";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";

const read = (path: string) => readFileSync(path, "utf8");
const calendar: ExternalCalendarSource = { provider: "google", id: "primary@example.com", name: "Primary", primary: true, accessRole: "owner", writable: true };

function event(overrides: Partial<ExternalCalendarEvent> = {}): ExternalCalendarEvent {
  return { provider: "google", calendarId: calendar.id, calendarName: "Primary", id: "event-1", title: "Planning", kind: "meeting", allDay: false, start: "2026-08-16T09:00:00", end: "2026-08-16T10:00:00", startDateKey: "2026-08-16", endDateKey: "2026-08-16", editable: true, ...overrides };
}

function draft(overrides: Partial<ExternalCalendarEventDraft> = {}): ExternalCalendarEventDraft {
  return { calendarId: calendar.id, title: "Planning updated", description: "", location: "", allDay: false, startDateKey: "2026-08-16", endDateKey: "2026-08-16", startTime: "09:30", endTime: "10:30", repeat: "none", notifyAttendees: false, ...overrides };
}

function jsonResponse(payload: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => payload } as Response;
}

test("initial sync is bounded while incremental sync uses only syncToken", () => {
  const initial = new URL(buildGoogleSyncEventsUrl(calendar.id, "Asia/Tehran", { now: new Date("2026-08-16T12:00:00Z") }));
  assert.equal(initial.searchParams.get("singleEvents"), "true");
  assert.equal(initial.searchParams.get("showDeleted"), "true");
  assert.equal(initial.searchParams.get("timeMin"), "2025-08-16T12:00:00.000Z");
  const incremental = new URL(buildGoogleSyncEventsUrl(calendar.id, "Asia/Tehran", { syncToken: "sync-2" }));
  assert.equal(incremental.searchParams.get("syncToken"), "sync-2");
  assert.equal(incremental.searchParams.has("timeMin"), false);
  assert.equal(incremental.searchParams.has("timeMax"), false);
  assert.equal(incremental.searchParams.has("orderBy"), false);
});

test("incremental sync merges changed and deleted items into cache", async () => {
  let stored = { version: 1 as const, calendarId: calendar.id, syncToken: "sync-old", events: [event({ id: "old" })], updatedAt: "2026-08-16T08:00:00.000Z" };
  const cache: GoogleCalendarSyncCacheAdapter = { read: async () => stored, write: async (entry) => { stored = entry; }, remove: async () => { throw new Error("unexpected reset"); } };
  const urls: string[] = [];
  const fetcher = (async (input: string | URL | Request) => {
    urls.push(String(input));
    return jsonResponse({ items: [{ id: "old", status: "cancelled" }, { id: "new", summary: "New", eventType: "default", etag: "etag-new", iCalUID: "new@google", start: { dateTime: "2026-08-16T11:00:00" }, end: { dateTime: "2026-08-16T12:00:00" } }], nextSyncToken: "sync-new" });
  }) as typeof fetch;
  const result = await syncGoogleCalendarEvents("token", calendar, "Asia/Tehran", fetcher, cache);
  assert.equal(result.mode, "incremental");
  assert.deepEqual(result.events.map((item) => item.id), ["new"]);
  assert.equal(stored.syncToken, "sync-new");
  assert.match(urls[0], /syncToken=sync-old/);
});

test("410 clears stale cache and falls back to full sync", async () => {
  let removed = 0;
  let stored = { version: 1 as const, calendarId: calendar.id, syncToken: "expired-token", events: [event({ id: "stale" })], updatedAt: "2026-08-16T08:00:00.000Z" };
  const cache: GoogleCalendarSyncCacheAdapter = { read: async () => stored, write: async (entry) => { stored = entry; }, remove: async () => { removed += 1; stored = { ...stored, syncToken: "", events: [] }; } };
  const urls: string[] = [];
  const fetcher = (async (input: string | URL | Request) => {
    const url = String(input); urls.push(url);
    if (url.includes("syncToken=expired-token")) return jsonResponse({}, 410);
    return jsonResponse({ items: [{ id: "fresh", summary: "Fresh", eventType: "default", start: { dateTime: "2026-08-16T13:00:00" }, end: { dateTime: "2026-08-16T14:00:00" } }], nextSyncToken: "fresh-token" });
  }) as typeof fetch;
  const result = await syncGoogleCalendarEvents("token", calendar, "Asia/Tehran", fetcher, cache);
  assert.equal(result.mode, "full");
  assert.equal(removed, 1);
  assert.deepEqual(result.events.map((item) => item.id), ["fresh"]);
  assert.match(urls[1], /timeMin=/);
});

test("duplicate copies collapse and overlapping timed events are flagged", () => {
  const a = event({ id: "a", iCalUid: "shared@google", originalStart: "2026-08-16T09:00:00" });
  const b = event({ id: "b", calendarId: "team@example.com", calendarName: "Team", iCalUid: "shared@google", originalStart: "2026-08-16T09:00:00" });
  const c = event({ id: "c", iCalUid: "review@google", start: "2026-08-16T09:30:00", end: "2026-08-16T10:30:00" });
  const agenda = buildCalendarDayAgenda([a, b, c], "2026-08-16");
  assert.equal(agenda.length, 2);
  assert.deepEqual(agenda.map((item) => item.duplicateCount).sort(), [1, 2]);
  assert.equal(agenda.every((item) => item.conflict), true);
  assert.equal(summarizeCalendarWeek([a, b, c], ["2026-08-16"])[0].duplicateCount, 1);
});

test("Event to Activity is explicit duplicate-safe and never clocks the user in", () => {
  const source = event({ id: "activity-source", iCalUid: "activity@google" });
  assert.equal(canConvertCalendarEventToActivity(source), true);
  const initial = createInitialData({ onboarded: true });
  const converted = addCalendarEventActivity(initial, source, "meeting");
  const record = converted.records["2026-08-16"];
  assert.equal(record.start, "");
  assert.equal(record.end, "");
  assert.equal(record.activitySegments.length, 1);
  assert.equal(record.activitySegments[0].id, externalCalendarActivityId(source));
  assert.equal(externalCalendarActivityId(source), externalCalendarActivityId(event({ id: "copy", calendarId: "team@example.com", iCalUid: "activity@google" })));
  assert.equal(addCalendarEventActivity(converted, source, "meeting"), converted);
  assert.equal(canConvertCalendarEventToActivity(event({ allDay: true })), false);
});

test("event update and delete use If-Match for stale-write protection", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetcher = (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    return init?.method === "DELETE" ? jsonResponse(undefined, 204) : jsonResponse({ id: "event-1" });
  }) as typeof fetch;
  await updateGoogleCalendarEvent("token", calendar.id, "event-1", draft(), "Asia/Tehran", fetcher, '"etag-v1"');
  await deleteGoogleCalendarEvent("token", calendar.id, "event-1", false, fetcher, '"etag-v2"');
  assert.equal((calls[0].init?.headers as Record<string, string>)["If-Match"], '"etag-v1"');
  assert.equal((calls[1].init?.headers as Record<string, string>)["If-Match"], '"etag-v2"');
});

test("whole-series edit uses parent ETag and preserves recurrence pattern", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetcher = (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    if (!init?.method) return jsonResponse({ id: "series-parent", etag: '"series-etag"', recurrence: ["RRULE:FREQ=WEEKLY"], start: { dateTime: "2026-08-16T09:00:00", timeZone: "Asia/Tehran" }, end: { dateTime: "2026-08-16T10:00:00", timeZone: "Asia/Tehran" } });
    return jsonResponse({ id: "series-parent" });
  }) as typeof fetch;
  await updateGoogleCalendarSeries("token", event({ recurringEventId: "series-parent" }), draft({ startTime: "10:00", endTime: "11:00" }), "Asia/Tehran", fetcher);
  const patch = calls.find((call) => call.init?.method === "PATCH");
  assert.ok(patch);
  assert.equal((patch.init?.headers as Record<string, string>)["If-Match"], '"series-etag"');
  const body = JSON.parse(String(patch.init?.body)) as Record<string, unknown>;
  assert.equal("recurrence" in body, false);
});

test("Calendar intelligence UI exposes Day Week conflicts duplicates activity import and recurring scope", () => {
  const surface = read("components/calendar/calendar-agenda-surface.tsx");
  const list = read("components/calendar/calendar-event-list.tsx");
  const dialog = read("components/calendar/calendar-event-dialog.tsx");
  assert.match(surface, /calendar\.google\.viewDay/);
  assert.match(surface, /CalendarWeekPlanner/);
  assert.match(surface, /addCalendarEventActivity/);
  assert.match(list, /data-calendar-conflict/);
  assert.match(list, /data-calendar-duplicate/);
  assert.match(dialog, /CalendarRecurringEditScope/);
});

test("sync cache stays outside AppData while tokens remain memory-only and disconnect clears cache", () => {
  const cache = read("lib/calendar-integration/sync-cache.ts");
  const controller = read("components/calendar/use-calendar-integration-controller.ts");
  const identity = read("lib/calendar-integration/google-identity.ts");
  assert.match(cache, /saatyar-calendar-cache/);
  assert.match(cache, /indexedDB\.open/);
  assert.doesNotMatch(cache, /localStorage/);
  assert.match(controller, /clearGoogleCalendarSyncCache/);
  assert.doesNotMatch(identity, /localStorage\.setItem|indexedDB\.open/);
});

test("Phase 190 stays schema-v20 dependency-neutral and documented", () => {
  assert.ok(APP_DATA_SCHEMA_VERSION >= 20);
  const notes = read("docs/phases/PHASE_190_NOTES_FA.md");
  const backlog = read("docs/roadmap/BACKLOG_FA.md");
  const features = read("docs/releases/NEXT_RELEASE_FEATURES_FA.md");
  const pkg = JSON.parse(read("package.json")) as { scripts: { test: string } };
  assert.match(notes, /a904631/);
  assert.match(notes, /syncToken/);
  assert.match(notes, /410/);
  assert.match(notes, /If-Match/);
  assert.match(notes, /Event → Activity/);
  assert.match(notes, /WorkRecord/);
  assert.match(backlog, /\[x\] فاز ۱۹۰/);
  assert.match(features, /Phase 190/);
  assert.match(pkg.scripts.test, /phase190-calendar-intelligence\.test\.ts/);
});
