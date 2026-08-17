import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";

const read = (path: string) => readFileSync(path, "utf8");

test("weekly chart is anchored to the selected seven-day week instead of aggregating same weekdays across the month", () => {
  const month = read("components/pages/month/month-page.tsx");
  const range = read("components/pages/month/weekly-chart/week-range.ts");
  const hook = read("components/pages/month/weekly-chart/use-weekly-chart-data.ts");
  assert.match(month, /<WeeklyChart data=\{data\} selectedDate=\{selectedDate\}/);
  assert.doesNotMatch(month, /weekValues|filter\(\(item\).*getDay/);
  assert.match(range, /getSelectedWeekDateKeys/);
  assert.match(range, /getDay\(\) \+ 1\) % 7/);
  assert.match(hook, /getSelectedWeekDateKeys\(selectedDate\)/);
});

test("weekly chart uses the same holiday-aware record calculation as the month calendar", () => {
  const hook = read("components/pages/month/weekly-chart/use-weekly-chart-data.ts");
  const visual = read("components/pages/month/weekly-chart/weekly-chart-visual.tsx");
  const tooltip = read("components/pages/month/weekly-chart/weekly-tooltip.tsx");
  assert.match(hook, /getHolidayInfo/);
  assert.match(hook, /holiday: holidayInfo\.isHoliday/);
  assert.match(hook, /calc\(effectiveRecord, getDailyTargetMinutes/);
  assert.match(visual, /data-weekly-day-status/);
  assert.match(visual, /var\(--danger\)/);
  assert.match(tooltip, /item\?\.minutes/);
  assert.match(tooltip, /holidayLabel/);
});

test("event create and edit dialog keeps header and footer visible while only the body scrolls", () => {
  const dialog = read("components/calendar/calendar-event-dialog.tsx");
  assert.match(dialog, /data-calendar-event-dialog-header/);
  assert.match(dialog, /data-calendar-event-dialog-body[^>]*min-h-0 flex-1 overflow-y-auto/);
  assert.match(dialog, /data-calendar-event-dialog-footer/);
  assert.match(dialog, /flex max-h-\[min\(760px,calc\(100dvh-24px\)\)\] flex-col gap-0 overflow-hidden/);
  assert.match(dialog, /!flex cursor-pointer items-start gap-3[\s\S]*notifyAttendees/);
});

test("calendar event rows expose a direct safe delete path without forcing edit mode", () => {
  const list = read("components/calendar/calendar-event-list.tsx");
  assert.match(list, /Trash2/);
  assert.match(list, /setDeletingEvent\(event\)/);
  assert.match(list, /CalendarEventDeleteDialog/);
  assert.match(list, /onDelete\?:/);
});

test("Google Calendar CRUD reports success and failure through the shared app toast", () => {
  const shell = read("components/saatyar-shell.tsx");
  const provider = read("components/calendar/calendar-integration-provider.tsx");
  const controller = read("components/calendar/use-calendar-integration-controller.ts");
  assert.match(shell, /CalendarIntegrationProvider onToast=\{controller\.setToast\}/);
  assert.match(provider, /onToast\?: \(message: string\) => void/);
  assert.match(controller, /calendar\.google\.toast\.created/);
  assert.match(controller, /calendar\.google\.toast\.updated/);
  assert.match(controller, /calendar\.google\.toast\.deleted/);
  assert.match(controller, /calendar\.google\.toast\.error/);
});

test("Month discovers Google Calendar before Settings and offers create near the records table", () => {
  const month = read("components/pages/month/month-page.tsx");
  const callout = read("components/calendar/calendar-connect-callout.tsx");
  const quick = read("components/calendar/calendar-event-quick-action.tsx");
  assert.match(month, /CalendarConnectCallout/);
  assert.match(month, /CalendarEventQuickAction dateKey=\{selectedDate\} compact/);
  assert.match(callout, /integration\.connect\(\)/);
  assert.match(callout, /data-calendar-connect-callout/);
  assert.match(quick, /CalendarEventDialog/);
});

test("mobile header restores the brand mark and Google settings controls keep RTL alignment", () => {
  const header = read("components/layout/app-header.tsx");
  const sources = read("components/calendar/google-calendar-source-list.tsx");
  const deletion = read("components/calendar/calendar-event-delete-dialog.tsx");
  assert.match(header, /BrandMark size=\{34\}/);
  assert.match(header, /max-\[520px\]:block/);
  assert.match(sources, /className="!flex cursor-pointer items-center gap-3/);
  assert.match(deletion, /className="!flex cursor-pointer items-start gap-3/);
});

test("Phase 189A stays dependency and schema neutral while handing off Settings IA", () => {
  const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string>; dependencies: Record<string, string> };
  const roadmap = read("docs/roadmap/BACKLOG_FA.md");
  const notes = read("docs/phases/PHASE_189A_NOTES_FA.md");
  const releaseFeatures = read("docs/releases/NEXT_RELEASE_FEATURES_FA.md");
  assert.match(pkg.scripts.test, /phase189-calendar-ux-polish/);
  assert.equal(pkg.scripts.test.length < 8191, true);
  assert.equal(Object.keys(pkg.dependencies).some((name) => /googleapis|gapi|calendar/i.test(name)), false);
  assert.match(roadmap, /فاز ۱۸۹A: Calendar UX Polish/);
  assert.match(roadmap, /فاز ۱۸۹(?:B)?: Settings Information Architecture/);
  assert.match(notes, /Schema v19/);
  assert.match(releaseFeatures, /Phase 189A/);
  assert.ok(APP_DATA_SCHEMA_VERSION >= 19);
});
