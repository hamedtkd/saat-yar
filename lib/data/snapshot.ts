import type { AppData } from "../types.ts";
import { APP_DATA_SCHEMA_VERSION, APP_DATA_STORAGE_FORMAT } from "./version.ts";

export type AppDataSnapshot = {
  format: typeof APP_DATA_STORAGE_FORMAT;
  schemaVersion: typeof APP_DATA_SCHEMA_VERSION;
  savedAt: string;
  data: AppData;
};

export function createAppDataSnapshot(
  data: AppData,
  savedAt = new Date().toISOString(),
): AppDataSnapshot {
  return {
    format: APP_DATA_STORAGE_FORMAT,
    schemaVersion: APP_DATA_SCHEMA_VERSION,
    savedAt,
    data,
  };
}
