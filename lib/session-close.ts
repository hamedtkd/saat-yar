import type { AppData, WorkRecord } from "./types.ts";

export const SESSION_CLOSE_KEY = "saatyar:pending-session-close";
export const SESSION_HEARTBEAT_KEY = "saatyar:session-heartbeat";
export const SESSION_HEARTBEAT_INTERVAL_MS = 30_000;
export const SESSION_HEARTBEAT_STALE_MS = 90_000;

type PendingClose = { date: string; closedAt: string };
export type SessionHeartbeat = { date: string; seenAt: string };

export function createPendingClose(date: string, record: WorkRecord, now = new Date()): PendingClose | null {
  if (!record.start || record.end) return null;
  return { date, closedAt: now.toISOString() };
}

export function createSessionHeartbeat(date: string, record: WorkRecord, now = new Date()): SessionHeartbeat | null {
  if (!record.start || record.end) return null;
  return { date, seenAt: now.toISOString() };
}

function closeOpenRecord(data: AppData, date: string, closedAt: string, reason: "page-exit" | "stale-session") {
  const record = data.records[date];
  if (!record?.start || record.end) return data;
  const closed = new Date(closedAt);
  const end = `${String(closed.getHours()).padStart(2, "0")}:${String(closed.getMinutes()).padStart(2, "0")}`;
  return {
    ...data,
    records: {
      ...data.records,
      [date]: {
        ...record,
        end,
        endedAt: closedAt,
        autoClosedAt: closedAt,
        autoClosedReason: reason,
        needsReview: true,
        updatedAt: closedAt,
      },
    },
  };
}

export function applyPendingClose(data: AppData, pending: PendingClose) {
  return closeOpenRecord(data, pending.date, pending.closedAt, "page-exit");
}

export function applyStaleHeartbeat(
  data: AppData,
  heartbeat: SessionHeartbeat,
  now = new Date(),
  staleAfterMs = SESSION_HEARTBEAT_STALE_MS,
) {
  const seenAt = new Date(heartbeat.seenAt).getTime();
  if (!Number.isFinite(seenAt) || now.getTime() - seenAt < staleAfterMs) return data;
  return closeOpenRecord(data, heartbeat.date, heartbeat.seenAt, "stale-session");
}

export function parsePendingClose(value: string | null): PendingClose | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as PendingClose;
    if (!parsed.date || !Number.isFinite(new Date(parsed.closedAt).getTime())) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function parseSessionHeartbeat(value: string | null): SessionHeartbeat | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as SessionHeartbeat;
    if (!parsed.date || !Number.isFinite(new Date(parsed.seenAt).getTime())) return null;
    return parsed;
  } catch {
    return null;
  }
}
