import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  activeTrackingMinutes,
  breakReminderSnoozeKey,
  isRecordPaused,
  notificationSnoozeKey,
} from "../lib/notification-reminders.ts";
import { makeWorkRecord } from "./fixtures/work-record.ts";

const baseRecord = () => makeWorkRecord({
  date: "2026-08-05",
  start: "08:00",
  end: "",
  startedAt: "2026-08-05T08:00:00.000Z",
});

test("active reminder time excludes lunch and breaks", () => {
  const record = baseRecord();
  record.lunchStartedAt = "2026-08-05T08:30:00.000Z";
  record.lunchEndedAt = "2026-08-05T08:45:00.000Z";
  record.breaks = [{
    id: "break-1",
    title: "استراحت",
    start: "",
    end: "",
    startedAt: "2026-08-05T09:00:00.000Z",
    endedAt: "2026-08-05T09:10:00.000Z",
  }];

  const now = new Date("2026-08-05T09:30:00.000Z").getTime();
  assert.equal(activeTrackingMinutes(record, now, 0), 65);
});

test("open pauses are detected and subtracted through the current time", () => {
  const record = baseRecord();
  record.breaks = [{
    id: "break-open",
    title: "استراحت",
    start: "",
    end: "",
    startedAt: "2026-08-05T08:40:00.000Z",
  }];
  const now = new Date("2026-08-05T09:00:00.000Z").getTime();

  assert.equal(isRecordPaused(record), true);
  assert.equal(activeTrackingMinutes(record, now, 0), 40);
});

test("notification hook avoids whole-record effect dependencies and supports daily snooze", async () => {
  const hook = await readFile(new URL("../hooks/controller/use-notification-reminders.ts", import.meta.url), "utf8");
  const card = await readFile(new URL("../components/pages/settings/notification-settings-card.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(hook, /\], \[[\s\S]*?\brecord\b/);
  assert.match(hook, /evaluateNotificationReminders/);
  assert.match(hook, /breakReminderSnoozeKey/);
  assert.match(hook, /notificationSnoozeKey/);
  assert.match(card, /s\("Do not remind me today"\)/);
  assert.equal(breakReminderSnoozeKey("2026-08-05"), "saatyar-break-reminder-snooze:2026-08-05");
  assert.equal(notificationSnoozeKey("2026-08-05"), "saatyar-notification-snooze-until:2026-08-05");
});
