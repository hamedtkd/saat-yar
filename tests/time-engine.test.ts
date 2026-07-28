import assert from "node:assert/strict";
import test from "node:test";
import { calc, minutesToTime, spanMinutes } from "../app/time-engine.ts";

const record = (start: string, lunchMinutes = 45) => ({
  start,
  end: "",
  lunchMinutes,
  breaks: [],
  leaveMinutes: 0,
  leaveType: "none" as const,
  holiday: false,
});

test("suggests 16:00 for 07:15 with eight hours plus 45 minute lunch", () => {
  assert.equal(minutesToTime(calc(record("07:15"), 480).plannedExit), "16:00");
});

test("suggests 16:15 for 07:30 with eight hours plus 45 minute lunch", () => {
  assert.equal(minutesToTime(calc(record("07:30"), 480).plannedExit), "16:15");
});

test("adds unpaid breaks to suggested checkout", () => {
  const value = { ...record("07:30"), breaks: [{ start: "10:00", end: "10:30" }] };
  assert.equal(minutesToTime(calc(value, 480).plannedExit), "16:45");
});

test("does not add paid breaks to suggested checkout", () => {
  const value = { ...record("07:30"), breaks: [{ start: "10:00", end: "10:30", paid: true }] };
  assert.equal(minutesToTime(calc(value, 480).plannedExit), "16:15");
});

test("calculates durations that cross midnight", () => {
  assert.equal(spanMinutes("23:30", "01:00"), 90);
});

test("credits full-day leave without creating a deficit", () => {
  const value = { ...record("07:30"), leaveType: "full" as const };
  assert.equal(calc(value, 480, new Date("2026-07-28T07:30:00")).balance, 0);
});
