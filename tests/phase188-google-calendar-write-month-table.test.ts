import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";
import {
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  GOOGLE_CALENDAR_EVENTS_SCOPE,
  GOOGLE_CALENDAR_LIST_SCOPE,
  GOOGLE_CALENDAR_SCOPES,
  googleCalendarRoleCanWrite,
  updateGoogleCalendarEvent,
} from "../lib/calendar-integration/google-calendar.ts";
import { createExternalCalendarDraft, validateExternalCalendarDraft } from "../lib/calendar-integration/draft.ts";

const read = (path: string) => readFileSync(path, "utf8");

function sampleDraft() {
  return {
    ...createExternalCalendarDraft("2026-08-17", "primary"),
    title: "Design review",
    startTime: "09:00",
    endTime: "10:00",
  };
}

test("Google Calendar write uses narrow calendar-list and event scopes", () => {
  assert.deepEqual([...GOOGLE_CALENDAR_SCOPES], [
    "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
    "https://www.googleapis.com/auth/calendar.events",
  ]);
  assert.equal(GOOGLE_CALENDAR_LIST_SCOPE.endsWith("calendar.calendarlist.readonly"), true);
  assert.equal(GOOGLE_CALENDAR_EVENTS_SCOPE.endsWith("calendar.events"), true);
  assert.equal(GOOGLE_CALENDAR_SCOPES.includes("https://www.googleapis.com/auth/calendar" as never), false);
  assert.equal(googleCalendarRoleCanWrite("owner"), true);
  assert.equal(googleCalendarRoleCanWrite("writer"), true);
  assert.equal(googleCalendarRoleCanWrite("reader"), false);
  const identity = read("lib/calendar-integration/google-identity.ts");
  assert.doesNotMatch(identity, /consent select_account/);
  assert.match(identity, /prompt: "select_account"/);
});

test("Google event REST mutations create update and delete with explicit guest notification policy", async () => {
  const calls: Array<{ url: string; method: string; body: string }> = [];
  const fakeFetch = (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(input), method: init?.method ?? "GET", body: String(init?.body ?? "") });
    return new Response(init?.method === "DELETE" ? null : JSON.stringify({ id: "event-1" }), { status: init?.method === "DELETE" ? 204 : 200 });
  }) as typeof fetch;
  const draft = sampleDraft();
  await createGoogleCalendarEvent("token", draft, "Asia/Tehran", fakeFetch);
  await updateGoogleCalendarEvent("token", "primary", "event-1", { ...draft, notifyAttendees: false }, "Asia/Tehran", fakeFetch);
  await deleteGoogleCalendarEvent("token", "primary", "event-1", false, fakeFetch);
  assert.deepEqual(calls.map((call) => call.method), ["POST", "PATCH", "DELETE"]);
  assert.match(calls[0]!.url, /sendUpdates=all/);
  assert.match(calls[1]!.url, /sendUpdates=none/);
  assert.match(calls[2]!.url, /sendUpdates=none/);
  assert.match(calls[0]!.body, /Design review/);
});

test("event draft validation covers title dates time and simple recurrence", () => {
  const draft = sampleDraft();
  assert.equal(validateExternalCalendarDraft(draft), null);
  assert.equal(validateExternalCalendarDraft({ ...draft, title: "  " }), "title");
  assert.equal(validateExternalCalendarDraft({ ...draft, endDateKey: "2026-08-16" }), "date");
  assert.equal(validateExternalCalendarDraft({ ...draft, endTime: "08:30" }), "time");
  assert.equal(validateExternalCalendarDraft({ ...draft, allDay: true, endTime: "08:30" }), null);
  assert.equal({ ...draft, repeat: "weekly" as const }.repeat, "weekly");
});

test("shared event modal uses Saatyar pickers and safe recurring delete actions", () => {
  const dialog = read("components/calendar/calendar-event-dialog.tsx");
  const deletion = read("components/calendar/calendar-event-delete-dialog.tsx");
  assert.match(dialog, /DialogContent/);
  assert.match(dialog, /JalaliDatePicker/);
  assert.match(dialog, /TimePicker/);
  assert.match(dialog, /notifyAttendees/);
  assert.match(dialog, /repeat\.weekly/);
  assert.match(deletion, /deleteSeries/);
  assert.match(deletion, /deleteOccurrence/);
  assert.match(dialog, /operationFailed/);
  assert.match(deletion, /operationFailed/);
  const fa = read("lib/i18n/fa.ts");
  const en = read("lib/i18n/en.ts");
  for (const catalog of [fa, en]) {
    assert.match(catalog, /['"]common\.save['"]:/);
    assert.match(catalog, /['"]common\.delete['"]:/);
  }
});

test("Settings stays compact while Today and Month share one writable calendar agenda", () => {
  const settings = read("components/pages/settings/google-calendar-card.tsx");
  const agenda = read("components/calendar/calendar-agenda-surface.tsx");
  const today = read("components/pages/today/today-page.tsx");
  const month = read("components/pages/month/month-page.tsx");
  assert.doesNotMatch(settings, /GoogleCalendarPreview/);
  assert.match(settings, /<details/);
  assert.match(settings, /GoogleCalendarSourceList/);
  assert.match(agenda, /CalendarEventDialog/);
  assert.match(agenda, /createEvent/);
  assert.match(today, /CalendarAgendaCard/);
  assert.match(month, /CalendarAgendaSurface/);
  assert.equal(existsSync("app/calendar/page.tsx"), false);
});

test("Month calendar keeps Google context separate from Saatyar holiday calculations", () => {
  const calendar = read("components/pages/month/month-calendar.tsx");
  assert.match(calendar, /data-external-calendar-count/);
  assert.match(calendar, /getHolidayInfo/);
  assert.doesNotMatch(calendar, /externalEvents[\s\S]{0,120}(holidayOverrides|autoOfficialHolidays|isHoliday\s*=)/);
  assert.doesNotMatch(read("lib/time-engine.ts"), /ExternalCalendar|GoogleCalendar/);
});

test("Month records table has shared sorting desktop accessibility and mobile controls", () => {
  const table = read("components/pages/month/month-table.tsx");
  const desktop = read("components/pages/month/table/month-desktop-table.tsx");
  const header = read("components/pages/month/table/month-table-header.tsx");
  const utils = read("components/pages/month/table/month-table-utils.ts");
  assert.match(table, /sortMonthRecords/);
  assert.match(desktop, /aria-sort/);
  assert.match(desktop, /sticky start-0/);
  assert.match(header, /data-month-table-sort/);
  assert.match(header, /toggleSortDirection/);
  assert.match(utils, /worked|totalRest|balance/);
});

test("Phase 188 is documented dependency-neutral and registers Settings IA plus release feature inventory", () => {
  const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string>; dependencies: Record<string, string> };
  const notes = read("docs/phases/PHASE_188_NOTES_FA.md");
  const setup = read("docs/calendar/GOOGLE_CALENDAR_WRITE_FA.md");
  const roadmap = read("docs/roadmap/BACKLOG_FA.md");
  const releaseFeatures = read("docs/releases/NEXT_RELEASE_FEATURES_FA.md");
  assert.match(pkg.scripts.test, /phase188-google-calendar-write-month-table/);
  assert.match(pkg.scripts.test, /tests\/\*\*\/\*\.test\.ts/);
  assert.equal(pkg.scripts.test.length < 8191, true);
  assert.match(pkg.scripts.test, /tests\/phase97-repository-standards\.test\.ts/);
  assert.match(read("scripts/release-audit.mjs"), /coversAllTests/);
  for (const path of [
    "components/calendar/calendar-integration-provider.tsx",
    "components/calendar/calendar-integration-context.ts",
    "components/calendar/use-calendar-integration-controller.ts",
  ]) assert.equal(read(path).split(/\r?\n/).length <= 250, true, `${path} exceeds 250 lines`);
  assert.equal(Object.keys(pkg.dependencies).some((name) => /googleapis|gapi|calendar/i.test(name)), false);
  assert.match(notes, /Schema.*v19/i);
  assert.match(setup, /calendar\.events/);
  assert.match(setup, /Source of Truth/);
  assert.match(roadmap, /فاز ۱۸۹(?:B)?: Settings Information Architecture/);
  assert.match(roadmap, /فاز ۱۹۰: Calendar Intelligence/);
  assert.match(releaseFeatures, /LinkedIn/);
  assert.equal(APP_DATA_SCHEMA_VERSION, 19);
});
