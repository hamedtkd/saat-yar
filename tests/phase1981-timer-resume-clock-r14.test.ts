import assert from "node:assert/strict";
import test from "node:test";

import { projectTimerElapsedSeconds, type ProjectTimerSession } from "../lib/project-timer-session.ts";

const resumedSession: ProjectTimerSession = {
  version: 1,
  phase: "running",
  sessionStartedAt: "2026-08-19T04:00:00.000Z",
  activeEntryId: "entry-new",
  segmentStartedAt: "2026-08-19T04:10:00.000Z",
  accumulatedSeconds: 61,
  clientId: "client-1",
  projectId: "project-1",
  task: "Resume timer",
  note: "",
  billable: true,
  effectiveRate: 100,
};

test("Phase 198.1 R14 resumed elapsed prefers the session segment boundary over a stale active entry", () => {
  const stalePreviousEntry = { startedAt: "2026-08-19T04:00:00.000Z" };
  const now = new Date("2026-08-19T04:10:02.000Z").getTime();

  assert.equal(projectTimerElapsedSeconds(stalePreviousEntry, resumedSession, now), 63);
});

test("Phase 198.1 R14 paused elapsed remains frozen even while the shared runtime clock stays warm", () => {
  const paused: ProjectTimerSession = {
    ...resumedSession,
    phase: "paused",
    pausedAt: "2026-08-19T04:10:02.000Z",
    segmentStartedAt: undefined,
    accumulatedSeconds: 63,
  };

  assert.equal(projectTimerElapsedSeconds(undefined, paused, new Date("2026-08-19T04:15:00.000Z").getTime()), 63);
});
