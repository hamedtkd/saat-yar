import assert from "node:assert/strict";
import test from "node:test";

import { initialData } from "../lib/constants.ts";
import { getAutoStartSetup } from "../lib/pwa-autostart.ts";
import { parseRuntimePreferences } from "../lib/runtime-preferences.ts";
import {
  applySystemSuspendRecovery,
  createSystemSuspendHeartbeat,
  detectSystemSuspend,
} from "../lib/system-suspend.ts";
import type { ProjectTimerSession } from "../lib/project-timer-session.ts";
import { makeWorkRecord } from "./fixtures/work-record.ts";


test("system suspend detector ignores an ordinary hidden-tab scheduling gap", () => {
  assert.equal(detectSystemSuspend(
    { wallMs: 0, monotonicMs: 0, visible: false },
    { wallMs: 180_000, monotonicMs: 180_000, visible: true },
  ), false);
});

test("system suspend detector catches a visible event-loop stall and sleep clock drift", () => {
  assert.equal(detectSystemSuspend(
    { wallMs: 0, monotonicMs: 0, visible: true },
    { wallMs: 90_000, monotonicMs: 90_000, visible: true },
  ), true);
  assert.equal(detectSystemSuspend(
    { wallMs: 0, monotonicMs: 0, visible: false },
    { wallMs: 120_000, monotonicMs: 10_000, visible: true },
  ), true);
});

test("suspend recovery closes attendance pauses and the running project segment at the heartbeat", () => {
  const heartbeatAt = new Date("2026-09-20T08:30:00.000Z");
  const record = makeWorkRecord({
    date: "2026-09-20",
    start: "10:00",
    end: "",
    lunchMinutes: 0,
    lunchStart: "11:00",
    lunchEnd: "",
    lunchStartedAt: "2026-09-20T07:30:00.000Z",
    lunchEndedAt: undefined,
    breaks: [{ id: "break-1", start: "11:20", end: "", startedAt: "2026-09-20T07:50:00.000Z", title: "Pause", paid: false }],
    activitySegments: [{ id: "activity-1", kind: "project", start: "11:25", end: "", startedAt: "2026-09-20T07:55:00.000Z" }],
  });
  const entry = {
    id: "entry-1", clientId: "client-1", projectId: "project-1", task: "Task",
    startedAt: "2026-09-20T08:00:00.000Z", endedAt: null, note: "", billable: true, effectiveRate: 100,
  };
  const data = { ...initialData, records: { [record.date]: record }, timeEntries: [entry] };
  const session: ProjectTimerSession = {
    version: 1, phase: "running", sessionStartedAt: entry.startedAt, activeEntryId: entry.id,
    segmentStartedAt: entry.startedAt, accumulatedSeconds: 120, clientId: entry.clientId, projectId: entry.projectId,
    task: entry.task, note: entry.note, billable: entry.billable, effectiveRate: entry.effectiveRate,
  };
  const heartbeat = createSystemSuspendHeartbeat(data, session, heartbeatAt);
  assert.ok(heartbeat);
  const result = applySystemSuspendRecovery(data, session, heartbeat!);
  const closed = result.data.records[record.date];
  assert.equal(result.changed, true);
  assert.ok(closed.end);
  assert.equal(closed.lunchEnd, closed.end);
  assert.equal(closed.breaks[0].end, closed.end);
  assert.equal(closed.activitySegments[0].end, closed.end);
  assert.equal(closed.endedAt, heartbeat!.seenAt);
  assert.equal(closed.autoClosedReason, "stale-session");
  assert.equal(closed.needsReview, true);
  assert.equal(result.data.timeEntries[0].endedAt, heartbeat!.seenAt);
  assert.equal(result.session?.phase, "paused");
  assert.equal(result.session?.pausedAt, heartbeat!.seenAt);
  assert.equal(result.session?.accumulatedSeconds, 120 + 30 * 60);
});

test("runtime preferences default sleep protection on and keep startup setup device-local", () => {
  assert.deepEqual(parseRuntimePreferences(null), { pauseTimersOnSystemSuspend: true, autoStartConfigured: false });
  assert.deepEqual(parseRuntimePreferences('{"pauseTimersOnSystemSuspend":false,"autoStartConfigured":true}'), { pauseTimersOnSystemSuspend: false, autoStartConfigured: true });
});

test("auto-start guide targets the installed-app pages in Edge and Chrome", () => {
  assert.equal(getAutoStartSetup("Mozilla/5.0 Edg/145.0").internalUrl, "edge://apps");
  assert.equal(getAutoStartSetup("Mozilla/5.0 Chrome/145.0 Safari/537.36").internalUrl, "chrome://apps");
});
