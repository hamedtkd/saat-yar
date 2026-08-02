import assert from "node:assert/strict";
import test from "node:test";
import { calc, minutesToTime, spanMinutes, timeToMinutes } from "../lib/time-engine.ts";
import type { WorkRecord } from "../lib/types.ts";

function record(overrides: Partial<WorkRecord> = {}): WorkRecord {
  return {
    date: "2026-08-02",
    start: "07:30",
    end: "16:15",
    lunchMinutes: 45,
    breaks: [],
    leaveMinutes: 0,
    leaveType: "none",
    note: "",
    holiday: false,
    ...overrides,
  };
}

test("suggests 16:15 for 07:30 with eight hours plus 45 minute lunch", () => {
  assert.equal(minutesToTime(calc(record({ end: "" }), 480, new Date("2026-08-02T07:30:00")).plannedExit), "16:15");
});

test("subtracts unpaid lunch and unpaid breaks from net work", () => {
  const result = calc(record({ breaks: [{ id: "break-1", title: "وقفه", start: "10:00", end: "10:30" }] }), 480);
  assert.equal(result.grossMinutes, 525);
  assert.equal(result.unpaidLunchMinutes, 45);
  assert.equal(result.unpaidBreakMinutes, 30);
  assert.equal(result.worked, 450);
  assert.equal(result.balance, -30);
});

test("does not subtract paid lunch or paid breaks", () => {
  const result = calc(record({
    lunchPaid: true,
    breaks: [{ id: "break-1", title: "جلسه داخلی", start: "10:00", end: "10:30", paid: true }],
  }), 480);
  assert.equal(result.worked, 525);
  assert.equal(result.balance, 45);
});

test("does not invent work time when a day has not started", () => {
  const result = calc(record({ start: "", end: "" }), 480, new Date("2026-08-02T14:00:00"));
  assert.equal(result.grossMinutes, 0);
  assert.equal(result.worked, 0);
  assert.equal(result.credited, 0);
});

test("credits full-day leave without creating a deficit", () => {
  const result = calc(record({ start: "", end: "", lunchMinutes: 0, leaveType: "full" }), 480);
  assert.equal(result.leave, 480);
  assert.equal(result.balance, 0);
});

test("calculates durations that cross midnight", () => {
  assert.equal(spanMinutes("23:30", "01:00"), 90);
});

test("rejects malformed times", () => {
  assert.equal(timeToMinutes("25:10"), 0);
  assert.equal(timeToMinutes("9:10"), 0);
});
