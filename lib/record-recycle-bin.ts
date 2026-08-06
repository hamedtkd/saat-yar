import type { AppData, DeletedWorkRecord, WorkRecord } from "./types.ts";

export const RECORD_RECYCLE_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

function cloneWorkRecord(record: WorkRecord): WorkRecord {
  return { ...record, breaks: record.breaks.map((item) => ({ ...item })) };
}

function expiryTimestamp(item: DeletedWorkRecord): number {
  const timestamp = new Date(item.expiresAt).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function createDeletedWorkRecord(date: string, record: WorkRecord, now = new Date(), id = crypto.randomUUID()): DeletedWorkRecord {
  return {
    id,
    date,
    record: cloneWorkRecord(record),
    deletedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + RECORD_RECYCLE_RETENTION_MS).toISOString(),
  };
}

export function activeDeletedRecords(items: DeletedWorkRecord[], now = new Date()): DeletedWorkRecord[] {
  const timestamp = now.getTime();
  return items.filter((item) => expiryTimestamp(item) > timestamp)
    .sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
}

export function expiredDeletedRecords(items: DeletedWorkRecord[], now = new Date()): DeletedWorkRecord[] {
  const timestamp = now.getTime();
  return items.filter((item) => expiryTimestamp(item) <= timestamp)
    .sort((a, b) => a.expiresAt.localeCompare(b.expiresAt));
}

export function restoreDeletedRecord(data: AppData, id: string): AppData {
  const deleted = data.deletedRecords.find((item) => item.id === id);
  if (!deleted || data.records[deleted.date]) return data;
  return {
    ...data,
    records: { ...data.records, [deleted.date]: { ...cloneWorkRecord(deleted.record), updatedAt: new Date().toISOString() } },
    deletedRecords: data.deletedRecords.filter((item) => item.id !== id),
  };
}

export function restoreAllDeletedRecords(data: AppData, now = new Date()): {
  data: AppData;
  restoredCount: number;
  blockedCount: number;
} {
  const activeItems = activeDeletedRecords(data.deletedRecords, now);
  const records = { ...data.records };
  const restoredIds = new Set<string>();
  let blockedCount = 0;

  for (const item of activeItems) {
    if (records[item.date]) {
      blockedCount += 1;
      continue;
    }
    records[item.date] = { ...cloneWorkRecord(item.record), updatedAt: now.toISOString() };
    restoredIds.add(item.id);
  }

  if (restoredIds.size === 0) return { data, restoredCount: 0, blockedCount };
  return {
    data: {
      ...data,
      records,
      deletedRecords: data.deletedRecords.filter((item) => !restoredIds.has(item.id)),
    },
    restoredCount: restoredIds.size,
    blockedCount,
  };
}

export function permanentlyDeleteRecord(data: AppData, id: string): AppData {
  return { ...data, deletedRecords: data.deletedRecords.filter((item) => item.id !== id) };
}

export function purgeExpiredDeletedRecords(data: AppData, now = new Date()): {
  data: AppData;
  removedCount: number;
} {
  const expiredIds = new Set(expiredDeletedRecords(data.deletedRecords, now).map((item) => item.id));
  if (expiredIds.size === 0) return { data, removedCount: 0 };
  return {
    data: { ...data, deletedRecords: data.deletedRecords.filter((item) => !expiredIds.has(item.id)) },
    removedCount: expiredIds.size,
  };
}
