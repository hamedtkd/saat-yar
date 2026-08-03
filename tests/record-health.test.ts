import assert from "node:assert/strict";
import test from "node:test";
import { getRecordStatus } from "../lib/record-health.ts";
import type { WorkRecord } from "../lib/types.ts";

function record(patch: Partial<WorkRecord> = {}): WorkRecord {
  return { date: "2026-08-03", start: "08:00", end: "16:00", lunchMinutes: 30, breaks: [], leaveMinutes: 0, leaveType: "none", note: "", holiday: false, ...patch };
}

test("marks a complete record as complete", () => {
  assert.equal(getRecordStatus(record()).state, "complete");
});

test("detects a missing work end", () => {
  const status = getRecordStatus(record({ end: "" }));
  assert.equal(status.state, "incomplete");
  assert.ok(status.issues.some((item) => item.code === "missing-end"));
});

test("detects partial lunch and open breaks", () => {
  const status = getRecordStatus(record({ lunchStart: "12:00", lunchEnd: "", breaks: [{ id: "b1", start: "14:00", end: "", title: "وقفه" }] }));
  assert.equal(status.state, "invalid");
  assert.ok(status.issues.some((item) => item.code === "partial-lunch"));
  assert.ok(status.issues.some((item) => item.code === "open-break"));
});
