import assert from "node:assert/strict";
import test from "node:test";
import { createInitialData } from "../lib/constants.ts";
import { activeTrackingMinutes, evaluateNotificationReminders } from "../lib/notification-reminders.ts";
import { calc } from "../lib/time-engine.ts";
import { makeWorkRecord } from "./fixtures/work-record.ts";
import type { WorkRecord } from "../lib/types.ts";

const baseTime = Date.parse("2026-10-04T09:00:00.000Z");
const instant = (minutes: number) => new Date(baseTime + minutes * 60_000).toISOString();

function settings(intervalMinutes = 60) {
  const value = structuredClone(createInitialData().settings.notificationSettings);
  value.enabled = true;
  value.openTimerReminderMinutes = 240;
  value.dailyTargetReminder = false;
  value.endOfDayReminder = false;
  value.breakReminder = { enabled: true, intervalMinutes, onlyWhenTracking: true };
  value.customReminders = [];
  return value;
}

function record(overrides: Partial<WorkRecord> = {}) {
  return makeWorkRecord({
    date: "2026-10-04",
    start: "09:00",
    end: "",
    startedAt: instant(0),
    ...overrides,
  });
}

function breakCandidates(workRecord: WorkRecord, elapsedMinutes: number, intervalMinutes = 60) {
  return evaluateNotificationReminders({
    settings: settings(intervalMinutes),
    record: workRecord,
    nowMs: baseTime + elapsedMinutes * 60_000,
    nowTime: "12:00",
    fallbackWorked: 0,
    dailyTarget: 0,
    suggestedExit: "",
  }).filter((candidate) => candidate.kind === "break");
}

test("Lunch resets 50 minutes of reminder progress; another full interval is required", () => {
  const afterLunch = record({
    lunchStart: "09:50", lunchEnd: "10:20",
    lunchStartedAt: instant(50), lunchEndedAt: instant(80),
  });
  assert.equal(breakCandidates(afterLunch, 90).length, 0); // 10 new minutes
  assert.equal(breakCandidates(afterLunch, 139).length, 0);
  assert.equal(breakCandidates(afterLunch, 140).length, 1); // 60 new active minutes
});

test("Break resets reminder progress", () => {
  const afterBreak = record({
    breaks: [{ id: "b1", start: "09:40", end: "09:50", startedAt: instant(40), endedAt: instant(50), title: "Break", paid: false }],
  });
  assert.equal(breakCandidates(afterBreak, 90).length, 0); // 40 new active minutes
  assert.equal(breakCandidates(afterBreak, 109).length, 0);
  assert.equal(breakCandidates(afterBreak, 110).length, 1); // 60 new active minutes
});

test("an open Lunch suppresses a reminder even after the old interval elapsed", () => {
  const lunchOpen = record({ lunchStart: "09:50", lunchStartedAt: instant(50) });
  assert.deepEqual(breakCandidates(lunchOpen, 80), []);
});

test("an open Break suppresses a reminder even after the old interval elapsed", () => {
  const breakOpen = record({
    breaks: [{ id: "b1", start: "09:50", end: "", startedAt: instant(50), title: "Break", paid: false }],
  });
  assert.deepEqual(breakCandidates(breakOpen, 80), []);
});

test("a Lunch starting at 59 minutes 59 seconds resets without an immediate reminder", () => {
  const start = baseTime;
  const lunchOpen = record({
    lunchStart: "09:59", lunchStartedAt: new Date(start + 59_990).toISOString(),
  });
  assert.deepEqual(breakCandidates(lunchOpen, 60), []);
  const resumed = { ...lunchOpen, lunchEnd: "10:00", lunchEndedAt: new Date(start + 60_000).toISOString() };
  assert.deepEqual(breakCandidates(resumed, 60), []);
});

test("a new cadence epoch gets its own reminder key after an earlier bucket fired", () => {
  const beforeLunch = record();
  const first = breakCandidates(beforeLunch, 60);
  assert.equal(first.length, 1);
  const afterLunch = record({
    lunchStart: "10:30", lunchEnd: "11:00",
    lunchStartedAt: instant(90), lunchEndedAt: instant(120),
  });
  assert.equal(breakCandidates(afterLunch, 150).length, 0);
  const nextEpoch = breakCandidates(afterLunch, 180);
  assert.equal(nextEpoch.length, 1);
  assert.notEqual(nextEpoch[0].key, first[0].key);
});

test("each completed Break or Lunch starts a fresh reminder interval", () => {
  const multiplePauses = record({
    breaks: [{ id: "b1", start: "09:20", end: "09:30", startedAt: instant(20), endedAt: instant(30), title: "Break", paid: false }],
    lunchStart: "10:10", lunchEnd: "10:30",
    lunchStartedAt: instant(70), lunchEndedAt: instant(90),
  });
  assert.equal(breakCandidates(multiplePauses, 130).length, 0); // 40 after Break, 40 after Lunch
  assert.equal(breakCandidates(multiplePauses, 150).length, 1); // 60 after Lunch
});

test("reminder progress after Lunch survives record reconstruction like an app reload", () => {
  const persistedRecord = record({
    lunchStart: "09:50", lunchEnd: "10:20",
    lunchStartedAt: instant(50), lunchEndedAt: instant(80),
  });
  const reloadedRecord = structuredClone(persistedRecord);
  assert.equal(breakCandidates(reloadedRecord, 100).length, 0); // 20 minutes after resume
  assert.equal(breakCandidates(reloadedRecord, 139).length, 0);
  assert.equal(breakCandidates(reloadedRecord, 140).length, 1);
});

test("normal no-pause cadence still notifies at each configured active-work bucket", () => {
  const workRecord = record();
  assert.deepEqual(breakCandidates(workRecord, 59), []);
  assert.deepEqual(breakCandidates(workRecord, 60).map(({ key }) => key), ["break-1"]);
  assert.deepEqual(breakCandidates(workRecord, 120).map(({ key }) => key), ["break-2"]);
  assert.deepEqual(breakCandidates(workRecord, 180).map(({ key }) => key), ["break-3"]);
});

test("reminder reset does not alter daily worked minutes or activity records", () => {
  const afterLunch = record({
    lunchMinutes: 30,
    lunchStart: "09:50", lunchEnd: "10:20",
    lunchStartedAt: instant(50), lunchEndedAt: instant(80),
  });
  assert.equal(activeTrackingMinutes(afterLunch, baseTime + 100 * 60_000, 0), 70);
  assert.equal(calc(afterLunch, 0, new Date(baseTime + 100 * 60_000)).worked, 70);
  assert.equal(breakCandidates(afterLunch, 100).length, 0);
  assert.equal(afterLunch.lunchStartedAt, instant(50));
});

test("attendance stop suppresses reminders and a new attendance start begins a new first bucket", () => {
  const finished = record({ end: "10:00", endedAt: instant(60) });
  assert.deepEqual(breakCandidates(finished, 120), []);
  const restarted = record({ start: "11:00", startedAt: instant(120) });
  assert.deepEqual(breakCandidates(restarted, 179), []);
  assert.equal(breakCandidates(restarted, 180).length, 1);
});
