import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";
import {
  buildGoogleEventsUrl,
  fetchGoogleCalendarEvents,
  fetchGoogleCalendars,
  mapGoogleEventKind,
  normalizeGoogleEvent,
  resolveGoogleCalendarConfig,
} from "../lib/calendar-integration/google-calendar.ts";
import {
  EXTERNAL_CALENDAR_PREFERENCES_KEY,
  readExternalCalendarPreferences,
  writeExternalCalendarPreferences,
} from "../lib/calendar-integration/preferences.ts";
import type { ExternalCalendarSource } from "../lib/calendar-integration/types.ts";

const read = (path: string) => readFileSync(path, "utf8");
const source: ExternalCalendarSource = { provider: "google", id: "primary@example.com", name: "Primary", primary: true, accessRole: "owner", writable: true };

test("Google Calendar config stays explicit while the Phase 187 read boundary remains documented", () => {
  assert.deepEqual(resolveGoogleCalendarConfig({}), { configured: false, clientId: "" });
  assert.deepEqual(resolveGoogleCalendarConfig({ NEXT_PUBLIC_GOOGLE_CALENDAR_CLIENT_ID: " client-id " }), { configured: true, clientId: "client-id" });
  assert.match(read("docs/calendar/GOOGLE_CALENDAR_READ_ONLY_FA.md"), /calendar\.readonly/);
});

test("calendar preferences store only selected source ids outside AppData", () => {
  const memory = new Map<string, string>();
  const storage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => { memory.set(key, value); },
  };
  writeExternalCalendarPreferences({ version: 1, provider: "google", selectedCalendarIds: ["a", "a", "b"] }, storage);
  assert.equal(EXTERNAL_CALENDAR_PREFERENCES_KEY, "saatyar-external-calendar-v1");
  assert.deepEqual(readExternalCalendarPreferences(storage).selectedCalendarIds, ["a", "b"]);
  const serialized = memory.get(EXTERNAL_CALENDAR_PREFERENCES_KEY) ?? "";
  assert.doesNotMatch(serialized, /access[_-]?token|refresh[_-]?token|event|summary|description/i);
  assert.equal(APP_DATA_SCHEMA_VERSION, 19);
});

test("Google events normalize into provider-neutral read-only meeting and activity context", () => {
  assert.equal(mapGoogleEventKind("default"), "meeting");
  assert.equal(mapGoogleEventKind("focusTime"), "focus");
  assert.equal(mapGoogleEventKind("outOfOffice"), "availability");
  assert.equal(mapGoogleEventKind("fromGmail"), "activity");

  const timed = normalizeGoogleEvent({
    id: "event-1",
    summary: "Planning",
    eventType: "default",
    start: { dateTime: "2026-08-17T09:00:00+03:30" },
    end: { dateTime: "2026-08-17T10:00:00+03:30" },
  }, source);
  assert.equal(timed?.allDay, false);
  assert.equal(timed?.startDateKey, "2026-08-17");
  assert.equal(timed?.endDateKey, "2026-08-17");
  assert.equal(timed?.kind, "meeting");

  const allDay = normalizeGoogleEvent({ id: "event-2", start: { date: "2026-08-18" }, end: { date: "2026-08-20" } }, source);
  assert.equal(allDay?.allDay, true);
  assert.equal(allDay?.startDateKey, "2026-08-18");
  assert.equal(allDay?.endDateKey, "2026-08-19");
  assert.equal(normalizeGoogleEvent({ id: "gone", status: "cancelled", start: { date: "2026-08-18" }, end: { date: "2026-08-19" } }, source), null);
});

test("event queries expand recurring instances inside an explicit local date range", () => {
  const url = new URL(buildGoogleEventsUrl("primary@example.com", {
    startDateKey: "2026-08-01",
    endDateKeyExclusive: "2026-09-01",
  }, "Asia/Tehran"));
  assert.match(url.pathname, /calendars\/primary%40example\.com\/events$/);
  assert.equal(url.searchParams.get("singleEvents"), "true");
  assert.equal(url.searchParams.get("orderBy"), "startTime");
  assert.equal(url.searchParams.get("showDeleted"), "false");
  assert.equal(url.searchParams.get("timeZone"), "Asia/Tehran");
  assert.ok(url.searchParams.get("timeMin")?.includes("2026-07-31T20:30:00.000Z") || url.searchParams.get("timeMin")?.includes("2026-08-01"));
});

test("calendar list and event fetchers paginate without a Google client dependency", async () => {
  const calls: string[] = [];
  const fakeFetch = (async (input: string | URL | Request) => {
    const url = String(input);
    calls.push(url);
    if (url.includes("calendarList")) {
      const second = url.includes("pageToken=next-cal");
      return new Response(JSON.stringify(second
        ? { items: [{ id: "team", summary: "Team", accessRole: "reader" }] }
        : { items: [{ id: "primary", summary: "Primary", primary: true, accessRole: "owner" }], nextPageToken: "next-cal" }), { status: 200 });
    }
    const second = url.includes("pageToken=next-event");
    return new Response(JSON.stringify(second
      ? { items: [{ id: "e2", eventType: "focusTime", start: { date: "2026-08-18" }, end: { date: "2026-08-19" } }] }
      : { items: [{ id: "e1", summary: "Meeting", eventType: "default", start: { dateTime: "2026-08-17T09:00:00Z" }, end: { dateTime: "2026-08-17T10:00:00Z" } }], nextPageToken: "next-event" }), { status: 200 });
  }) as typeof fetch;

  const calendars = await fetchGoogleCalendars("token", fakeFetch);
  assert.deepEqual(calendars.map((item) => item.id), ["primary", "team"]);
  const events = await fetchGoogleCalendarEvents("token", [calendars[0]!], { startDateKey: "2026-08-17", endDateKeyExclusive: "2026-08-20" }, "UTC", fakeFetch);
  assert.deepEqual(events.map((item) => item.id), ["e2", "e1"]);
  assert.ok(calls.length >= 4);
});

test("OAuth token stays memory-only and Google Identity loads only after explicit connect", () => {
  const identity = read("lib/calendar-integration/google-identity.ts");
  const provider = read("components/calendar/calendar-integration-provider.tsx");
  const controller = read("components/calendar/use-calendar-integration-controller.ts");
  assert.match(identity, /https:\/\/accounts\.google\.com\/gsi\/client/);
  assert.match(identity, /initTokenClient/);
  assert.match(identity, /error_callback/);
  assert.match(identity, /revoke/);
  assert.match(provider, /useCalendarIntegrationController/);
  assert.match(controller, /useRef<GoogleAccessSession \| null>/);
  assert.doesNotMatch(`${provider}\n${controller}`, /localStorage[\s\S]{0,160}accessToken|indexedDB[\s\S]{0,160}accessToken/i);
  assert.doesNotMatch(read("lib/types.ts"), /googleCalendar|externalCalendar|accessToken/);
  assert.doesNotMatch(read("lib/backup-schema.ts"), /googleCalendar|externalCalendar|accessToken/);
});

test("Settings Today and Month keep external calendar context separate from work totals", () => {
  const settings = read("components/pages/settings/google-calendar-card.tsx");
  const nav = read("components/pages/settings/settings-navigation-model.ts");
  const today = read("components/pages/today/today-page.tsx");
  const month = read("components/pages/month/month-page.tsx");
  const calendar = read("components/pages/month/month-calendar.tsx");
  const rangeHook = read("components/calendar/use-calendar-range.ts");
  assert.match(settings, /data-google-calendar-settings/);
  assert.match(settings, /GoogleCalendarSourceList/);
  assert.match(nav, /settings-calendar-integration/);
  assert.match(today, /CalendarAgendaCard/);
  assert.match(month, /useCalendarRange/);
  assert.match(month, /CalendarAgendaSurface/);
  assert.match(calendar, /data-external-calendar-count/);
  assert.match(rangeHook, /const \{ endDateKeyExclusive, startDateKey \} = range/);
  assert.match(rangeHook, /\[endDateKeyExclusive, loadRange, startDateKey, state\]/);
  assert.doesNotMatch(rangeHook, /void integration\.loadRange\(range\)/);
  assert.doesNotMatch(settings, /setData|WorkRecord/);
  assert.doesNotMatch(today, /calendarEvents[\s\S]{0,80}(todayCalc|dailyTarget)|todayCalc[\s\S]{0,80}calendarEvents/);
});

test("Phase 187 is documented browser-covered dependency-neutral and keeps schema v19", () => {
  const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string>; dependencies: Record<string, string> };
  const notes = read("docs/phases/PHASE_187_NOTES_FA.md");
  const setup = read("docs/calendar/GOOGLE_CALENDAR_READ_ONLY_FA.md");
  const roadmap = read("docs/roadmap/BACKLOG_FA.md");
  const smoke = read("scripts/production-browser-smoke.mjs");
  assert.match(pkg.scripts.test, /tests\/phase187-google-calendar-read-integration\.test\.ts/);
  assert.equal(Object.keys(pkg.dependencies).some((name) => /googleapis|gapi|calendar/i.test(name)), false);
  assert.match(notes, /Schema v19/);
  assert.match(notes, /memory-only/);
  assert.match(setup, /NEXT_PUBLIC_GOOGLE_CALENDAR_CLIENT_ID/);
  assert.match(setup, /calendar\.readonly/);
  assert.match(roadmap, /\[x\] فاز ۱۸۷: Google Calendar Architecture \+ Read Integration/);
  assert.match(smoke, /data-google-calendar-settings/);
  assert.match(smoke, /Google Calendar .*integration stays opt-in/);
  assert.equal(APP_DATA_SCHEMA_VERSION, 19);
});
