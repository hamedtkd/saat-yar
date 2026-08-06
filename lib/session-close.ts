import type { AppData, WorkRecord } from "./types.ts";

export const SESSION_CLOSE_KEY = "saatyar:pending-session-close";

type PendingClose = { date: string; closedAt: string };

export function createPendingClose(date: string, record: WorkRecord, now = new Date()): PendingClose | null {
  if (!record.start || record.end) return null;
  return { date, closedAt: now.toISOString() };
}

export function applyPendingClose(data: AppData, pending: PendingClose) {
  const record = data.records[pending.date];
  if (!record?.start || record.end) return data;
  const closed = new Date(pending.closedAt);
  const end = `${String(closed.getHours()).padStart(2, "0")}:${String(closed.getMinutes()).padStart(2, "0")}`;
  return {
    ...data,
    records: {
      ...data.records,
      [pending.date]: {
        ...record,
        end,
        endedAt: pending.closedAt,
        autoClosedAt: pending.closedAt,
        autoClosedReason: "page-exit" as const,
        needsReview: true,
        updatedAt: pending.closedAt,
      },
    },
  };
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
