import type { AppData, DeletedWorkRecord, WorkRecord } from "./types.ts";

export const RECORD_RECYCLE_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

export function createDeletedWorkRecord(date: string, record: WorkRecord, now = new Date(), id = crypto.randomUUID()): DeletedWorkRecord {
  return {
    id,
    date,
    record: { ...record, breaks: record.breaks.map((item) => ({ ...item })) },
    deletedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + RECORD_RECYCLE_RETENTION_MS).toISOString(),
  };
}

export function activeDeletedRecords(items: DeletedWorkRecord[], now = new Date()): DeletedWorkRecord[] {
  const timestamp = now.getTime();
  return items.filter((item) => new Date(item.expiresAt).getTime() > timestamp)
    .sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
}

export function restoreDeletedRecord(data: AppData, id: string): AppData {
  const deleted = data.deletedRecords.find((item) => item.id === id);
  if (!deleted || data.records[deleted.date]) return data;
  return {
    ...data,
    records: { ...data.records, [deleted.date]: { ...deleted.record, updatedAt: new Date().toISOString() } },
    deletedRecords: data.deletedRecords.filter((item) => item.id !== id),
  };
}

export function permanentlyDeleteRecord(data: AppData, id: string): AppData {
  return { ...data, deletedRecords: data.deletedRecords.filter((item) => item.id !== id) };
}
