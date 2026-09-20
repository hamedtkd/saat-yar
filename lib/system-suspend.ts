import { closeActiveActivitySegments } from "./activity-segments.ts";
import { projectTimerSegmentSeconds, type ProjectTimerSession } from "./project-timer-session.ts";
import { spanMinutes } from "./time-engine.ts";
import type { AppData, WorkRecord } from "./types.ts";

export const SYSTEM_SUSPEND_HEARTBEAT_KEY = "saatyar:system-suspend-heartbeat-v1";
export const SYSTEM_SUSPEND_TICK_MS = 10_000;
export const SYSTEM_SUSPEND_GAP_MS = 60_000;
export const SYSTEM_SUSPEND_CLOCK_DRIFT_MS = 45_000;
export const SYSTEM_SUSPEND_FREEZE_ARM_MS = 12_000;

export type SystemSuspendHeartbeat = {
  version: 1;
  seenAt: string;
  attendanceDate?: string;
  projectEntryId?: string;
};

export type SuspendTick = { wallMs: number; monotonicMs: number; visible: boolean };

export function detectSystemSuspend(previous: SuspendTick, next: SuspendTick, freezeCandidate = false) {
  if (freezeCandidate) return true;
  const wallDelta = next.wallMs - previous.wallMs;
  const monotonicDelta = next.monotonicMs - previous.monotonicMs;
  if (wallDelta < SYSTEM_SUSPEND_GAP_MS) return false;
  if (previous.visible && next.visible) return true;
  return wallDelta - monotonicDelta >= SYSTEM_SUSPEND_CLOCK_DRIFT_MS;
}

function currentTime(value: Date) {
  return `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
}

function findOpenAttendanceDate(data: AppData) {
  return Object.values(data.records)
    .filter((record) => record.start && !record.end)
    .sort((a, b) => b.date.localeCompare(a.date))[0]?.date;
}

function findOpenProjectEntryId(data: AppData, session: ProjectTimerSession | null) {
  if (session?.phase !== "running") return undefined;
  return data.timeEntries.find((entry) => !entry.endedAt && (
    session.activeEntryId ? entry.id === session.activeEntryId : entry.projectId === session.projectId
  ))?.id;
}

export function createSystemSuspendHeartbeat(data: AppData, session: ProjectTimerSession | null, now = new Date()): SystemSuspendHeartbeat | null {
  const attendanceDate = findOpenAttendanceDate(data);
  const projectEntryId = findOpenProjectEntryId(data, session);
  if (!attendanceDate && !projectEntryId) return null;
  return { version: 1, seenAt: now.toISOString(), attendanceDate, projectEntryId };
}

export function parseSystemSuspendHeartbeat(raw: string | null): SystemSuspendHeartbeat | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<SystemSuspendHeartbeat>;
    if (value.version !== 1 || typeof value.seenAt !== "string" || !Number.isFinite(new Date(value.seenAt).getTime())) return null;
    return {
      version: 1,
      seenAt: value.seenAt,
      attendanceDate: typeof value.attendanceDate === "string" ? value.attendanceDate : undefined,
      projectEntryId: typeof value.projectEntryId === "string" ? value.projectEntryId : undefined,
    };
  } catch {
    return null;
  }
}

function closeAttendanceAt(record: WorkRecord, closedAt: string) {
  if (!record.start || record.end) return record;
  const closed = new Date(closedAt);
  if (!Number.isFinite(closed.getTime())) return record;
  const end = currentTime(closed);
  const lunchOpen = Boolean(record.lunchStart && !record.lunchEnd);
  return {
    ...record,
    end,
    endedAt: closedAt,
    lunchEnd: lunchOpen ? end : record.lunchEnd,
    lunchEndedAt: lunchOpen ? closedAt : record.lunchEndedAt,
    lunchMinutes: lunchOpen ? spanMinutes(record.lunchStart ?? end, end) : record.lunchMinutes,
    breaks: record.breaks.map((entry) => entry.start && !entry.end ? { ...entry, end, endedAt: closedAt } : entry),
    activitySegments: closeActiveActivitySegments(record.activitySegments, end, closedAt),
    autoClosedAt: closedAt,
    autoClosedReason: "stale-session" as const,
    needsReview: true,
    updatedAt: closedAt,
  };
}

export function applySystemSuspendRecovery(data: AppData, session: ProjectTimerSession | null, heartbeat: SystemSuspendHeartbeat) {
  let nextData = data;
  let nextSession = session;
  let attendancePaused = false;
  let projectPaused = false;

  if (heartbeat.attendanceDate) {
    const record = data.records[heartbeat.attendanceDate];
    const closed = record ? closeAttendanceAt(record, heartbeat.seenAt) : record;
    if (record && closed !== record) {
      nextData = { ...nextData, records: { ...nextData.records, [heartbeat.attendanceDate]: closed } };
      attendancePaused = true;
    }
  }

  if (session?.phase === "running" && heartbeat.projectEntryId) {
    const entry = nextData.timeEntries.find((item) => item.id === heartbeat.projectEntryId && !item.endedAt);
    if (entry) {
      const segmentStart = session.segmentStartedAt ?? entry.startedAt;
      const accumulatedSeconds = session.accumulatedSeconds + projectTimerSegmentSeconds(segmentStart, heartbeat.seenAt);
      nextData = {
        ...nextData,
        timeEntries: nextData.timeEntries.map((item) => item.id === entry.id && !item.endedAt ? { ...item, endedAt: heartbeat.seenAt } : item),
      };
      nextSession = {
        ...session,
        phase: "paused",
        pausedAt: heartbeat.seenAt,
        segmentStartedAt: undefined,
        accumulatedSeconds,
      };
      projectPaused = true;
    }
  }

  return { data: nextData, session: nextSession, changed: attendancePaused || projectPaused, attendancePaused, projectPaused };
}
