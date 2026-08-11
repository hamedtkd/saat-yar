import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { defaultSettings } from "../lib/constants.ts";
import { calc, minutesToTime } from "../lib/time-engine.ts";
import {
  applyLunchMinutesToAll,
  applyLunchPaidToAll,
  getScheduleTargetMinutes,
  updateScheduleLunch,
  weekdayOrder,
} from "../lib/work-schedule.ts";
import type { WorkRecord } from "../lib/types.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

function record(start: string, lunchMinutes: number, lunchPaid = false): WorkRecord {
  return {
    date: "2026-08-09",
    start,
    end: "",
    lunchMinutes,
    lunchPaid,
    breaks: [],
    leaveMinutes: 0,
    leaveType: "none",
    note: "",
    holiday: false,
    manuallyEdited: true,
  };
}

test("company-style exit suggestion follows actual unpaid lunch duration", () => {
  assert.equal(minutesToTime(calc(record("07:30", 45), 480).plannedExit), "16:15");
  assert.equal(minutesToTime(calc(record("07:15", 45), 480).plannedExit), "16:00");
  assert.equal(minutesToTime(calc(record("07:15", 25), 480).plannedExit), "15:40");
  assert.equal(minutesToTime(calc(record("07:30", 30), 480).plannedExit), "16:00");
});

test("paid lunch counts toward credited time and does not extend planned exit", () => {
  const result = calc(record("07:30", 45, true), 480);
  assert.equal(result.unpaidLunchMinutes, 0);
  assert.equal(minutesToTime(result.plannedExit), "15:30");
});

test("schedule target distinguishes paid and unpaid lunch", () => {
  const unpaid = { enabled: true, start: "07:30", end: "16:15", lunchMinutes: 45, lunchPaid: false };
  const paid = { ...unpaid, lunchPaid: true };
  assert.equal(getScheduleTargetMinutes(unpaid), 480);
  assert.equal(getScheduleTargetMinutes(paid), 525);
});

test("changing one day's lunch preserves its net-work target and moves end time", () => {
  const schedule = { enabled: true, start: "07:30", end: "16:15", lunchMinutes: 45, lunchPaid: false };
  const shorterLunch = updateScheduleLunch(schedule, { lunchMinutes: 30 });
  assert.equal(getScheduleTargetMinutes(shorterLunch), 480);
  assert.equal(shorterLunch.end, "16:00");
});

test("bulk lunch settings update all weekdays without changing configured net work", () => {
  const settings = structuredClone(defaultSettings);
  const beforeTargets = Object.fromEntries(weekdayOrder.map((day) => [day, getScheduleTargetMinutes({ ...settings.weeklySchedule[day], enabled: true })]));
  const shorter = applyLunchMinutesToAll(settings, 30);
  const paid = applyLunchPaidToAll(shorter, true);

  for (const day of weekdayOrder) {
    assert.equal(shorter.weeklySchedule[day].lunchMinutes, 30);
    assert.equal(getScheduleTargetMinutes({ ...shorter.weeklySchedule[day], enabled: true }), beforeTargets[day]);
    assert.equal(paid.weeklySchedule[day].lunchPaid, true);
    assert.equal(getScheduleTargetMinutes({ ...paid.weeklySchedule[day], enabled: true }), beforeTargets[day]);
  }
});

test("settings and new daily records expose the global lunch contract", async () => {
  const [editor, derived, attendance] = await Promise.all([
    read("components/pages/settings/work-schedule-editor.tsx"),
    read("hooks/controller/use-controller-derived.ts"),
    read("hooks/controller/use-attendance-actions.ts"),
  ]);
  assert.match(editor, /s\("Default lunch for all days"\)/);
  assert.match(editor, /s\("Weekly net-work target"\)/);
  assert.match(editor, /applyLunchMinutesToAll/);
  assert.match(editor, /applyLunchPaidToAll/);
  assert.match(derived, /lunchPaid: Boolean\(selectedSchedule\.lunchPaid\)/);
  assert.match(attendance, /lunchMinutes: spanMinutes/);
});

test("settings search results stay above the sticky settings sidebar", async () => {
  const [search, nav] = await Promise.all([
    read("components/pages/settings/settings-search.tsx"),
    read("components/pages/settings/settings-nav.tsx"),
  ]);
  assert.match(search, /dashboard-card relative z-40/);
  assert.match(search, /top-\[calc\(100%-6px\)\] z-50/);
  assert.match(nav, /sticky top-\[84px\] z-20/);
});
