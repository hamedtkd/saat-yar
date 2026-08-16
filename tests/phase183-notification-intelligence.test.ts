import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createInitialData } from "../lib/constants.ts";
import { migrateAppData } from "../lib/data/migrations.ts";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";
import {
  activeTrackingMinutes,
  evaluateNotificationReminders,
  isNotificationSnoozed,
  isWithinQuietHours,
  notificationSnoozeKey,
} from "../lib/notification-reminders.ts";
import { makeWorkRecord } from "./fixtures/work-record.ts";

const read = (path: string) => readFileSync(path, "utf8");

test("schema v19 adds notification intelligence without changing released 2.4.0 data", () => {
  assert.ok(APP_DATA_SCHEMA_VERSION >= 19);
  const current = createInitialData({ onboarded: true });
  const legacy = structuredClone(current) as unknown as Record<string, unknown>;
  const settings = (legacy.settings as Record<string, unknown>);
  const notifications = settings.notificationSettings as Record<string, unknown>;
  delete notifications.quietHours;
  delete notifications.customReminders;
  delete notifications.snoozeMinutes;

  const result = migrateAppData({ schemaVersion: 18, data: legacy });
  assert.equal(result.fromVersion, 18);
  assert.equal(result.toVersion, APP_DATA_SCHEMA_VERSION);
  assert.deepEqual(result.data.settings.notificationSettings.quietHours, { enabled: false, start: "22:00", end: "07:00" });
  assert.deepEqual(result.data.settings.notificationSettings.customReminders, []);
  assert.equal(result.data.settings.notificationSettings.snoozeMinutes, 30);
  assert.equal(result.data.settings.workTimingMode, current.settings.workTimingMode);
});

test("active-work reminder time excludes lunch and breaks and pauses while a pause is open", () => {
  const record = makeWorkRecord({
    date: "2026-08-13",
    start: "08:00",
    end: "",
    startedAt: "2026-08-13T08:00:00.000Z",
    lunchStartedAt: "2026-08-13T09:00:00.000Z",
    lunchEndedAt: "2026-08-13T09:30:00.000Z",
    breaks: [{ id: "b1", start: "10:00", end: "10:15", title: "break", paid: false, startedAt: "2026-08-13T10:00:00.000Z", endedAt: "2026-08-13T10:15:00.000Z" }],
  });
  assert.equal(activeTrackingMinutes(record, new Date("2026-08-13T11:00:00.000Z").getTime(), 0), 135);

  const settings = createInitialData().settings.notificationSettings;
  settings.enabled = true;
  settings.openTimerReminderMinutes = 60;
  settings.dailyTargetReminder = true;
  const candidates = evaluateNotificationReminders({ settings, record, nowMs: new Date("2026-08-13T11:00:00.000Z").getTime(), nowTime: "11:00", fallbackWorked: 0, dailyTarget: 120, suggestedExit: "16:00" });
  assert.deepEqual(candidates.map((item) => item.kind), ["open-timer", "target"]);

  const paused = { ...record, lunchStartedAt: "2026-08-13T10:50:00.000Z", lunchEndedAt: undefined };
  const duringPause = evaluateNotificationReminders({ settings, record: paused, nowMs: new Date("2026-08-13T11:00:00.000Z").getTime(), nowTime: "11:00", fallbackWorked: 0, dailyTarget: 120, suggestedExit: "10:30" });
  assert.deepEqual(duringPause, []);
});

test("quiet hours support same-day and overnight windows", () => {
  assert.equal(isWithinQuietHours("13:00", "12:00", "14:00"), true);
  assert.equal(isWithinQuietHours("15:00", "12:00", "14:00"), false);
  assert.equal(isWithinQuietHours("23:30", "22:00", "07:00"), true);
  assert.equal(isWithinQuietHours("06:30", "22:00", "07:00"), true);
  assert.equal(isWithinQuietHours("12:00", "22:00", "07:00"), false);
  assert.equal(isWithinQuietHours("12:00", "08:00", "08:00"), false);
});

test("snooze suppresses all reminders and custom reminders repeat by active-work bucket", () => {
  const settings = createInitialData().settings.notificationSettings;
  settings.enabled = true;
  settings.openTimerReminderMinutes = 240;
  settings.dailyTargetReminder = false;
  settings.endOfDayReminder = false;
  settings.breakReminder.enabled = false;
  settings.customReminders = [{ id: "focus", enabled: true, intervalMinutes: 45, title: "Focus", message: "Reset" }];
  const record = makeWorkRecord({ date: "2026-08-13", start: "08:00", end: "", startedAt: "2026-08-13T08:00:00.000Z" });
  const nowMs = new Date("2026-08-13T09:35:00.000Z").getTime();
  assert.equal(notificationSnoozeKey("2026-08-13"), "saatyar-notification-snooze-until:2026-08-13");
  assert.equal(isNotificationSnoozed(nowMs + 1_000, nowMs), true);
  assert.deepEqual(evaluateNotificationReminders({ settings, record, nowMs, nowTime: "09:35", fallbackWorked: 0, dailyTarget: 0, suggestedExit: "", snoozeUntilMs: nowMs + 60_000 }), []);
  assert.deepEqual(evaluateNotificationReminders({ settings, record, nowMs, nowTime: "09:35", fallbackWorked: 0, dailyTarget: 0, suggestedExit: "" }).map((item) => item.key), ["custom-focus-2"]);
});

test("multiple custom reminders evaluate independently and transitional v19 data is normalized", () => {
  const settings = createInitialData().settings.notificationSettings;
  settings.enabled = true;
  settings.openTimerReminderMinutes = 240;
  settings.dailyTargetReminder = false;
  settings.endOfDayReminder = false;
  settings.breakReminder.enabled = false;
  settings.customReminders = [
    { id: "move", enabled: true, intervalMinutes: 30, title: "Move", message: "Stand" },
    { id: "review", enabled: true, intervalMinutes: 60, title: "Review", message: "Review" },
  ];
  const record = makeWorkRecord({ date: "2026-08-13", start: "08:00", end: "", startedAt: "2026-08-13T08:00:00.000Z" });
  const candidates = evaluateNotificationReminders({ settings, record, nowMs: new Date("2026-08-13T09:05:00.000Z").getTime(), nowTime: "09:05", fallbackWorked: 0, dailyTarget: 0, suggestedExit: "" });
  assert.deepEqual(candidates.map((item) => item.key), ["custom-move-2", "custom-review-1"]);

  const transitional = structuredClone(createInitialData({ onboarded: true })) as unknown as Record<string, unknown>;
  const transitionalSettings = transitional.settings as Record<string, unknown>;
  const notifications = transitionalSettings.notificationSettings as Record<string, unknown>;
  delete notifications.customReminders;
  notifications.customReminder = { enabled: true, intervalMinutes: 75, title: "Legacy R1", message: "Keep me" };
  const normalized = migrateAppData({ schemaVersion: 19, data: transitional });
  assert.deepEqual(normalized.data.settings.notificationSettings.customReminders, [
    { id: "legacy-custom-1", enabled: true, intervalMinutes: 75, title: "Legacy R1", message: "Keep me" },
  ]);
});

test("mobile settings navigation collapses persistent chrome into a compact section picker", () => {
  const nav = read("components/pages/settings/settings-nav.tsx");
  const mobile = read("components/pages/settings/settings-mobile-nav.tsx");
  const search = read("components/pages/settings/settings-search.tsx");
  const browserSmoke = read("scripts/production-browser-smoke.mjs");
  assert.match(nav, /SettingsMobileNav/);
  assert.match(mobile, /data-settings-mobile-trigger/);
  assert.match(mobile, /data-settings-mobile-dialog/);
  assert.match(mobile, /DialogTrigger asChild/);
  assert.match(search, /max-\[900px\]:hidden/);
  assert.match(browserSmoke, /Settings compact mobile navigation/);
});

test("Settings and runtime expose quiet hours custom reminders and global snooze", () => {
  const card = read("components/pages/settings/notification-settings-card.tsx");
  const controls = read("components/pages/settings/notification-intelligence-controls.tsx");
  const customEditor = read("components/pages/settings/custom-reminders-editor.tsx");
  const hook = read("hooks/controller/use-notification-reminders.ts");
  const browserSmoke = read("scripts/production-browser-smoke.mjs");
  assert.match(card, /data-reminder-snooze/);
  assert.match(card, /notificationSnoozeKey/);
  assert.match(controls, /data-notification-intelligence/);
  assert.match(controls, /data-quiet-hours/);
  assert.match(customEditor, /data-custom-reminder/);
  assert.match(customEditor, /MAX_CUSTOM_REMINDERS = 5/);
  assert.match(customEditor, /data-add-custom-reminder/);
  assert.match(hook, /evaluateNotificationReminders/);
  assert.doesNotMatch(hook, /credited/);
  assert.match(browserSmoke, /English notification intelligence settings/);
});

test("Phase 183 is documented and wired while released 2.4.0 remains schema v17", () => {
  const packageJson = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
  const manifest = JSON.parse(read("docs/releases/2.4.0.json")) as { dataSchemaVersion: number; status: string; tag: string };
  const backlog = read("docs/roadmap/BACKLOG_FA.md");
  const notes = read("docs/phases/PHASE_183_NOTES_FA.md");
  assert.equal(manifest.dataSchemaVersion, 17);
  assert.equal(manifest.status, "released");
  assert.equal(manifest.tag, "v2.4.0");
  assert.match(backlog, /\[x\] فاز ۱۸۳:/);
  assert.match(notes, /Schema v19/);
  assert.match(packageJson.scripts.test, /tests\/phase183-notification-intelligence\.test\.ts/);
});
