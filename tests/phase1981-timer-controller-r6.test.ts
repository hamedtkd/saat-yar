import assert from "node:assert/strict";
import test from "node:test";

import {
  getProjectTimerRecoveryAction,
  parseProjectTimerSession,
  projectTimerElapsedSeconds,
  projectTimerSegmentSeconds,
} from "../lib/project-timer-session.ts";
import { wheelScrollTopFromPointerDrag } from "../lib/pickers/wheel.ts";

const baseSession = {
  version: 1 as const,
  phase: "running" as const,
  sessionStartedAt: "2026-08-18T08:00:00.000Z",
  activeEntryId: "entry-2",
  segmentStartedAt: "2026-08-18T08:10:00.000Z",
  accumulatedSeconds: 300,
  clientId: "client-1",
  projectId: "project-1",
  task: "Timer UI",
  note: "R6",
  billable: true,
  effectiveRate: 100,
};

test("Phase 198.1 R6 project timer elapsed time excludes a persisted pause", () => {
  const activeEntry = { startedAt: "2026-08-18T08:10:00.000Z" };
  const now = new Date("2026-08-18T08:10:30.000Z").getTime();
  assert.equal(projectTimerElapsedSeconds(activeEntry, baseSession, now), 330);
  assert.equal(projectTimerSegmentSeconds("2026-08-18T08:10:00.000Z", "2026-08-18T08:10:30.000Z"), 30);
  assert.equal(projectTimerElapsedSeconds(undefined, { ...baseSession, phase: "paused", accumulatedSeconds: 330 }, now + 60_000), 330);
});

test("Phase 198.1 R6 paused project timer state round-trips through the browser-local contract", () => {
  const paused = { ...baseSession, phase: "paused" as const, activeEntryId: "entry-2", segmentStartedAt: undefined, pausedAt: "2026-08-18T08:10:30.000Z", accumulatedSeconds: 330 };
  assert.deepEqual(parseProjectTimerSession(JSON.stringify(paused)), paused);
  assert.equal(parseProjectTimerSession("not-json"), null);
});

test("Phase 198.1 R6 time wheel mouse drag maps pointer movement to scroll position", () => {
  assert.equal(wheelScrollTopFromPointerDrag(440, 300, 256), 484);
  assert.equal(wheelScrollTopFromPointerDrag(44, 200, 300), 0);
});


test("Phase 198.1 R6 paused refresh closes a stale open segment at the persisted pause time", () => {
  const pausedAt = "2026-08-18T09:20:00.000Z";
  const session = parseProjectTimerSession(JSON.stringify({
    version: 1, phase: "paused", sessionStartedAt: "2026-08-18T09:00:00.000Z",
    activeEntryId: "entry-1", pausedAt, accumulatedSeconds: 1200, clientId: "client-1", projectId: "project-1",
    task: "UI", note: "", billable: true, effectiveRate: 100,
  }));
  assert.deepEqual(getProjectTimerRecoveryAction(session, [{ id: "entry-1", projectId: "project-1", endedAt: null }]), {
    type: "close-entry", entryId: "entry-1", endedAt: pausedAt,
  });
});

test("Phase 198.1 R6 stale running metadata clears only after persistence has no matching open entry", () => {
  const session = parseProjectTimerSession(JSON.stringify({
    version: 1, phase: "running", sessionStartedAt: "2026-08-18T09:00:00.000Z", activeEntryId: "entry-1",
    segmentStartedAt: "2026-08-18T09:00:00.000Z", accumulatedSeconds: 0, clientId: "client-1", projectId: "project-1",
    task: "UI", note: "", billable: true, effectiveRate: 100,
  }));
  assert.deepEqual(getProjectTimerRecoveryAction(session, [{ id: "entry-1", projectId: "project-1", endedAt: null }]), { type: "none" });
  assert.deepEqual(getProjectTimerRecoveryAction(session, []), { type: "clear-session" });
});
