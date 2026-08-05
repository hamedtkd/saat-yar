import { parseBackup } from "./backup-schema.ts";
import { APP_DATA_SCHEMA_VERSION } from "./data/version.ts";
import type { AppData } from "./types.ts";

export type BackupEnvelope = {
  appName: "ساعت‌یار";
  schemaVersion: typeof APP_DATA_SCHEMA_VERSION;
  exportedAt: string;
  data: AppData;
};

export function createBackupEnvelope(data: AppData, exportedAt = new Date().toISOString()): BackupEnvelope {
  return {
    appName: "ساعت‌یار",
    schemaVersion: APP_DATA_SCHEMA_VERSION,
    exportedAt,
    data,
  };
}

export function parseBackupEnvelope(value: unknown): AppData {
  return parseBackup(value);
}

function mergeById<T extends { id: string }>(current: T[], incoming: T[]) {
  const existingIds = new Set(current.map((item) => item.id));
  return [...current, ...incoming.filter((item) => !existingIds.has(item.id))];
}

export function mergeAppData(current: AppData, incoming: AppData): AppData {
  return {
    settings: { ...current.settings, ...incoming.settings },
    records: { ...current.records, ...incoming.records },
    leaves: mergeById(current.leaves, incoming.leaves),
    clients: mergeById(current.clients, incoming.clients),
    projects: mergeById(current.projects, incoming.projects),
    timeEntries: mergeById(current.timeEntries, incoming.timeEntries),
    expenses: mergeById(current.expenses, incoming.expenses),
    invoices: mergeById(current.invoices, incoming.invoices),
    holidayOverrides: mergeById(current.holidayOverrides, incoming.holidayOverrides),
  };
}
