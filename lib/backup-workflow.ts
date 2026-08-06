import { parseBackup } from "./backup-schema.ts";
import { APP_DATA_SCHEMA_VERSION } from "./data/version.ts";
import type { AppData } from "./types.ts";

export { mergeAppData } from "./data/merge-app-data.ts";

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
