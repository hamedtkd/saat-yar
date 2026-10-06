import assert from "node:assert/strict";
import test from "node:test";
import { initialData } from "../lib/constants.ts";
import {
  SYSTEM_SUSPEND_HIDDEN_STALE_MS,
  applySystemSuspendRecovery,
  createSystemSuspendHeartbeat,
  detectSystemSuspend,
  parseSystemSuspendHeartbeat,
  recoverSystemSuspend,
  shouldRetainFailedRecoveryHeartbeat,
  shouldPreserveSuspendHeartbeat,
} from "../lib/system-suspend.ts";
import type { AppData } from "../lib/types.ts";
import type { ProjectTimerSession } from "../lib/project-timer-session.ts";
import { makeWorkRecord } from "./fixtures/work-record.ts";

const safeTime = "2026-09-20T08:30:00.000Z";

function attendanceData(): AppData {
  const record = makeWorkRecord({
    date: "2026-09-20",
    start: "10:00",
    end: "",
    lunchMinutes: 0,
    lunchStart: "11:00",
    lunchEnd: "",
    lunchStartedAt: "2026-09-20T07:30:00.000Z",
    breaks: [{ id: "break-1", start: "11:20", end: "", startedAt: "2026-09-20T07:50:00.000Z", title: "Pause", paid: false }],
    activitySegments: [{ id: "activity-1", kind: "project", start: "11:25", end: "", startedAt: "2026-09-20T07:55:00.000Z" }],
  });
  return { ...initialData, records: { [record.date]: record } };
}

function projectState() {
  const entry = {
    id: "entry-1", clientId: "client-1", projectId: "project-1", task: "Task",
    startedAt: "2026-09-20T08:00:00.000Z", endedAt: null, note: "", billable: true, effectiveRate: 100,
  };
  const data = { ...initialData, timeEntries: [entry] };
  const session: ProjectTimerSession = {
    version: 1, phase: "running", sessionStartedAt: entry.startedAt, activeEntryId: entry.id,
    segmentStartedAt: entry.startedAt, accumulatedSeconds: 120, clientId: entry.clientId, projectId: entry.projectId,
    task: entry.task, note: entry.note, billable: entry.billable, effectiveRate: entry.effectiveRate,
  };
  return { data, session };
}

test("a large visible suspend gap is detected", () => {
  assert.equal(detectSystemSuspend(
    { wallMs: 0, monotonicMs: 0, visible: true },
    { wallMs: 90_000, monotonicMs: 90_000, visible: true },
  ), true);
});

test("an ordinary hidden scheduling gap stays active when hidden heartbeats continue", () => {
  let previous = { wallMs: 0, monotonicMs: 0, visible: false, heartbeatAgeMs: 0 };
  for (let minute = 1; minute <= 30; minute += 1) {
    const next = { wallMs: minute * 60_000, monotonicMs: minute * 60_000, visible: false, heartbeatAgeMs: 10_000 };
    assert.equal(detectSystemSuspend(previous, next), false);
    previous = next;
  }
  assert.equal(detectSystemSuspend(previous, {
    wallMs: 1_810_000, monotonicMs: 1_810_000, visible: true, heartbeatAgeMs: 10_000,
  }), false);
});

test("a hidden-page hibernate is detected when clocks advance together but its heartbeat goes stale", () => {
  assert.equal(detectSystemSuspend(
    { wallMs: 0, monotonicMs: 0, visible: false },
    { wallMs: 1_800_000, monotonicMs: 1_800_000, visible: true, heartbeatAgeMs: 1_800_000 },
  ), true);
  assert.equal(SYSTEM_SUSPEND_HIDDEN_STALE_MS, 180_000);
});

test("employee recovery closes attendance and active segments at the safe heartbeat", () => {
  const data = attendanceData();
  const heartbeat = createSystemSuspendHeartbeat(data, null, new Date(safeTime));
  assert.ok(heartbeat);
  const result = applySystemSuspendRecovery(data, null, heartbeat!);
  const closed = result.data.records["2026-09-20"];
  assert.equal(closed.endedAt, safeTime);
  assert.equal(closed.lunchEndedAt, safeTime);
  assert.equal(closed.breaks[0].endedAt, safeTime);
  assert.equal(closed.activitySegments[0].endedAt, safeTime);
  assert.equal(closed.needsReview, true);
});

test("project recovery ends the segment at the safe heartbeat and pauses its session", () => {
  const { data, session } = projectState();
  const heartbeat = createSystemSuspendHeartbeat(data, session, new Date(safeTime));
  assert.ok(heartbeat);
  const result = applySystemSuspendRecovery(data, session, heartbeat!);
  assert.equal(result.data.timeEntries[0].endedAt, safeTime);
  assert.equal(result.session?.phase, "paused");
  assert.equal(result.session?.pausedAt, safeTime);
  assert.equal(result.session?.accumulatedSeconds, 120 + 30 * 60);
});

test("repeated recovery attempts do not close or accumulate the same episode twice", async () => {
  const { data, session } = projectState();
  const heartbeat = createSystemSuspendHeartbeat(data, session, new Date(safeTime))!;
  let currentData: AppData = data;
  let currentSession: ProjectTimerSession | null = session;
  let writes = 0;
  const first = await recoverSystemSuspend({
    enabled: true, data: currentData, session: currentSession, heartbeat,
    applyLocal: (nextData, nextSession) => { currentData = nextData; currentSession = nextSession; },
    persist: async () => { writes += 1; return true; },
  });
  const second = await recoverSystemSuspend({
    enabled: true, data: currentData, session: currentSession, heartbeat,
    applyLocal: () => assert.fail("unchanged recovery must not mutate local state again"),
    persist: async () => { writes += 1; return true; },
  });
  assert.equal(first, "saved");
  assert.equal(second, "unchanged");
  assert.equal(currentSession?.accumulatedSeconds, 120 + 30 * 60);
  assert.equal(writes, 1);
});

test("disabling suspend protection performs no local recovery or persistence", async () => {
  const { data, session } = projectState();
  const heartbeat = createSystemSuspendHeartbeat(data, session, new Date(safeTime))!;
  let mutations = 0;
  const outcome = await recoverSystemSuspend({
    enabled: false, data, session, heartbeat,
    applyLocal: () => { mutations += 1; },
    persist: async () => { mutations += 1; return true; },
  });
  assert.equal(outcome, "disabled");
  assert.equal(mutations, 0);
});

test("recovery consumes the pre-resume heartbeat even if storage is then refreshed", async () => {
  const { data, session } = projectState();
  const rawStorage = JSON.stringify(createSystemSuspendHeartbeat(data, session, new Date(safeTime)));
  const capturedBeforeResume = parseSystemSuspendHeartbeat(rawStorage);
  const resumeTime = "2026-09-20T14:30:00.000Z";
  const updatedStorage = JSON.stringify({ ...capturedBeforeResume, seenAt: resumeTime });
  assert.notEqual(updatedStorage, rawStorage);
  let recoveredData: AppData = data;
  const outcome = await recoverSystemSuspend({
    enabled: true, data, session, heartbeat: capturedBeforeResume!,
    applyLocal: (nextData) => { recoveredData = nextData; },
    persist: async () => true,
  });
  assert.equal(outcome, "saved");
  assert.equal(recoveredData.timeEntries[0].endedAt, safeTime);
  assert.notEqual(recoveredData.timeEntries[0].endedAt, resumeTime);
});

test("an early hidden-page resume event cannot overwrite evidence before visibility returns", () => {
  const beforeSleep = { wallMs: 0, monotonicMs: 0, visible: false };
  const resumedButHidden = { wallMs: 1_800_000, monotonicMs: 1_800_000, visible: false, heartbeatAgeMs: 1_800_000 };
  assert.equal(shouldPreserveSuspendHeartbeat(beforeSleep, resumedButHidden), true);
  const visibleAgain = { ...resumedButHidden, visible: true };
  assert.equal(detectSystemSuspend(beforeSleep, visibleAgain), true);
});

test("failed persistence retains the safe heartbeat and retry cannot re-add suspended time", async () => {
  const { data, session } = projectState();
  const heartbeat = createSystemSuspendHeartbeat(data, session, new Date(safeTime))!;
  let currentData: AppData = data;
  let currentSession: ProjectTimerSession | null = session;
  const storedHeartbeat = JSON.stringify(heartbeat);
  let persistCalls = 0;
  const outcome = await recoverSystemSuspend({
    enabled: true, data, session, heartbeat,
    applyLocal: (nextData, nextSession) => { currentData = nextData; currentSession = nextSession; },
    persist: async () => { persistCalls += 1; return false; },
  });
  assert.equal(currentData.timeEntries[0].endedAt, safeTime);
  assert.equal(currentSession?.phase, "paused");
  assert.equal(outcome, "save-failed");

  const failedSnapshot = { data: currentData, session: currentSession };
  assert.equal(shouldRetainFailedRecoveryHeartbeat(failedSnapshot, currentData, currentSession), true);
  assert.equal(parseSystemSuspendHeartbeat(storedHeartbeat)?.seenAt, safeTime);

  const repeated = await recoverSystemSuspend({
    enabled: true, data: currentData, session: currentSession,
    heartbeat: parseSystemSuspendHeartbeat(storedHeartbeat)!,
    applyLocal: () => assert.fail("repeated recovery must not mutate the recovered state"),
    persist: async () => { persistCalls += 1; return true; },
  });
  assert.equal(repeated, "unchanged");
  assert.equal(persistCalls, 1);
  assert.equal(currentSession?.accumulatedSeconds, 120 + 30 * 60);

  const persistedRetries: AppData[] = [];
  const retrySave = async (value: AppData) => { persistCalls += 1; persistedRetries.push(value); return true; };
  assert.equal(await retrySave(currentData), true);
  assert.equal(persistedRetries[0].timeEntries[0].endedAt, safeTime);
  assert.notEqual(persistedRetries[0].timeEntries[0].endedAt, "2026-09-20T14:30:00.000Z");
  assert.equal(persistCalls, 2);
  assert.equal(shouldRetainFailedRecoveryHeartbeat(failedSnapshot, { ...currentData }, currentSession), false);
});
