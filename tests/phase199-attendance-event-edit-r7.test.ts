import assert from "node:assert/strict";
import test from "node:test";

import { applyAttendanceEventEdit } from "../lib/attendance-event-edit.ts";
import type { WorkRecord } from "../lib/types.ts";

function recordFixture(): WorkRecord {
  return {
    date: "2026-08-19",
    start: "09:00",
    end: "17:00",
    lunchMinutes: 30,
    lunchStart: "13:00",
    lunchEnd: "13:30",
    lunchPaid: false,
    breaks: [{ id: "break-1", start: "15:00", end: "15:15", title: "استراحت", paid: false }],
    activitySegments: [],
    leaveMinutes: 0,
    leaveType: "none",
    note: "",
    holiday: false,
  };
}

test("Phase 199 R7 edits clock-in without requiring a full-day editor", () => {
  const patch = applyAttendanceEventEdit(recordFixture(), { kind: "clock-in" }, { start: "09:20" });
  assert.equal(patch.start, "09:20");
  assert.equal(patch.startedAt, undefined);
});

test("Phase 199 R7 recomputes lunch duration when lunch boundaries are edited", () => {
  const patch = applyAttendanceEventEdit(recordFixture(), { kind: "lunch" }, { start: "12:45", end: "13:25", paid: true });
  assert.equal(patch.lunchStart, "12:45");
  assert.equal(patch.lunchEnd, "13:25");
  assert.equal(patch.lunchMinutes, 40);
  assert.equal(patch.lunchPaid, true);
});

test("Phase 199 R7 edits only the selected break and preserves the rest of the record", () => {
  const record = recordFixture();
  record.breaks.push({ id: "break-2", start: "16:00", end: "16:05", title: "آب", paid: false });
  const patch = applyAttendanceEventEdit(record, { kind: "break", id: "break-1" }, { start: "15:05", end: "15:25", title: "جلسه کوتاه", paid: true });
  assert.equal(patch.breaks?.[0].start, "15:05");
  assert.equal(patch.breaks?.[0].end, "15:25");
  assert.equal(patch.breaks?.[0].title, "جلسه کوتاه");
  assert.equal(patch.breaks?.[0].paid, true);
  assert.deepEqual(patch.breaks?.[1], record.breaks[1]);
});
