import type { TimeEntry } from "./types";

export const PROJECT_TIMER_SESSION_STORAGE_KEY = "saatyar-project-timer-session-v1";
export const PROJECT_TIMER_SESSION_CHANGE_EVENT = "saatyar:project-timer-session-change";

export type ProjectTimerSession = {
  version: 1;
  phase: "running" | "paused";
  sessionStartedAt: string;
  activeEntryId?: string;
  segmentStartedAt?: string;
  pausedAt?: string;
  accumulatedSeconds: number;
  clientId: string;
  projectId: string;
  task: string;
  note: string;
  billable: boolean;
  effectiveRate: number;
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type ProjectTimerRecoveryAction =
  | { type: "none" }
  | { type: "clear-session" }
  | { type: "close-entry"; entryId: string; endedAt: string };

export function getProjectTimerRecoveryAction(
  session: ProjectTimerSession | null,
  entries: Array<Pick<TimeEntry, "id" | "projectId" | "endedAt">>,
): ProjectTimerRecoveryAction {
  if (!session) return { type: "none" };
  const openEntry = entries.find((entry) => !entry.endedAt && (
    session.activeEntryId ? entry.id === session.activeEntryId : entry.projectId === session.projectId
  ));
  if (session.phase === "running") return openEntry ? { type: "none" } : { type: "clear-session" };
  if (openEntry && session.pausedAt) return { type: "close-entry", entryId: openEntry.id, endedAt: session.pausedAt };
  return { type: "none" };
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(new Date(value).getTime());
}

export function parseProjectTimerSession(raw: string | null): ProjectTimerSession | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<ProjectTimerSession>;
    if (value.version !== 1 || (value.phase !== "running" && value.phase !== "paused")) return null;
    if (!isIsoDate(value.sessionStartedAt) || typeof value.projectId !== "string" || typeof value.clientId !== "string") return null;
    return {
      version: 1,
      phase: value.phase,
      sessionStartedAt: value.sessionStartedAt,
      activeEntryId: typeof value.activeEntryId === "string" ? value.activeEntryId : undefined,
      segmentStartedAt: isIsoDate(value.segmentStartedAt) ? value.segmentStartedAt : undefined,
      pausedAt: isIsoDate(value.pausedAt) ? value.pausedAt : undefined,
      accumulatedSeconds: Math.max(0, Math.floor(Number(value.accumulatedSeconds) || 0)),
      clientId: value.clientId,
      projectId: value.projectId,
      task: typeof value.task === "string" ? value.task : "",
      note: typeof value.note === "string" ? value.note : "",
      billable: value.billable !== false,
      effectiveRate: Math.max(0, Number(value.effectiveRate) || 0),
    };
  } catch {
    return null;
  }
}

export function readProjectTimerSession(storage?: Pick<StorageLike, "getItem">) {
  if (!storage) return null;
  try {
    return parseProjectTimerSession(storage.getItem(PROJECT_TIMER_SESSION_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function writeProjectTimerSession(session: ProjectTimerSession | null, storage?: StorageLike) {
  if (!storage) return;
  try {
    if (session) storage.setItem(PROJECT_TIMER_SESSION_STORAGE_KEY, JSON.stringify(session));
    else storage.removeItem(PROJECT_TIMER_SESSION_STORAGE_KEY);
  } catch {
    // Timer persistence must never make the core IndexedDB write path fail.
  }
}

export function projectTimerSegmentSeconds(startedAt: string, endedAt: string) {
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
  return Math.max(0, Math.floor((end - start) / 1000));
}

export function projectTimerElapsedSeconds(
  activeEntry: Pick<TimeEntry, "startedAt"> | undefined,
  session: ProjectTimerSession | null,
  nowMs: number,
) {
  const base = session?.accumulatedSeconds ?? 0;
  if (session?.phase === "paused") return base;
  // A resumed session owns the current segment boundary. Prefer that timestamp
  // over a render-lagging activeEntry so accumulated time never resets or jumps
  // while React and IndexedDB settle the newly-created segment.
  const startedAt = session?.phase === "running" && session.segmentStartedAt
    ? session.segmentStartedAt
    : activeEntry?.startedAt;
  if (!startedAt) return base;
  const start = new Date(startedAt).getTime();
  if (!Number.isFinite(start)) return base;
  return base + Math.max(0, Math.floor((nowMs - start) / 1000));
}
