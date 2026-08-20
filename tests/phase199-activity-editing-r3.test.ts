import assert from "node:assert/strict";
import test from "node:test";

import {
  activitySegmentElapsedSeconds,
  activitySegmentMinutes,
  removeCompletedActivitySegment,
  updateCompletedActivitySegmentDuration,
} from "../lib/activity-segments.ts";
import type { ActivitySegment } from "../lib/types.ts";

const completed: ActivitySegment = {
  id: "segment-1",
  kind: "deep-work",
  title: "Refactor login",
  workProjectId: "work-1",
  start: "09:15",
  end: "09:45",
  startedAt: "2026-08-19T05:45:00.000Z",
  endedAt: "2026-08-19T06:15:00.000Z",
};

test("Phase 199 R3 edits time spent without asking the user to edit start/end boundaries", () => {
  const [updated] = updateCompletedActivitySegmentDuration([completed], completed.id, 95);
  assert.equal(updated.start, completed.start);
  assert.equal(updated.end, "10:50");
  assert.equal(updated.endedAt, "2026-08-19T07:20:00.000Z");
  assert.equal(updated.title, completed.title);
  assert.equal(updated.workProjectId, completed.workProjectId);
  assert.equal(activitySegmentMinutes(updated), 95);
});

test("Phase 199 R3 cannot rewrite a currently running activity through duration edit", () => {
  const active = { ...completed, end: "", endedAt: undefined };
  const [updated] = updateCompletedActivitySegmentDuration([active], active.id, 120);
  assert.deepEqual(updated, active);
});

test("Phase 199 R3 deletes completed activity history without deleting the live segment", () => {
  const active = { ...completed, id: "active", end: "", endedAt: undefined };
  const remaining = removeCompletedActivitySegment([completed, active], completed.id);
  assert.deepEqual(remaining.map((segment) => segment.id), ["active"]);
  const protectedLive = removeCompletedActivitySegment([active], active.id);
  assert.equal(protectedLive.length, 1);
});

test("Phase 199 R3 live elapsed clock keeps second-level precision", () => {
  const active: ActivitySegment = {
    ...completed,
    end: "",
    endedAt: undefined,
    startedAt: "2026-08-19T10:00:00.000Z",
  };
  assert.equal(activitySegmentElapsedSeconds(active, new Date("2026-08-19T10:01:17.000Z")), 77);
});
