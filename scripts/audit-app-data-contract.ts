import { parseBackup } from "../lib/backup-schema.ts";
import { createBackupEnvelope } from "../lib/backup-workflow.ts";
import { createInitialData, defaultSettings } from "../lib/constants.ts";
import { assertCompleteAppData, APP_DATA_KEYS } from "../lib/data/app-data-contract.ts";
import { createCompleteAppData } from "../lib/data/app-data-factory.ts";
import { mergeAppData } from "../lib/data/merge-app-data.ts";
import { migrateAppData } from "../lib/data/migrations.ts";
import { normaliseData } from "../lib/data/normalise.ts";
import { createAppDataSnapshot } from "../lib/data/snapshot.ts";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";
import { createRecoverySnapshot, recoverySnapshotToData } from "../lib/recovery.ts";
import type { AppData } from "../lib/types.ts";

const initial = createInitialData({ onboarded: true });
const legacy = { settings: structuredClone(defaultSettings), records: {} } as AppData;
const previousVersion = Math.max(1, APP_DATA_SCHEMA_VERSION - 1);

const candidates: Array<[string, unknown]> = [
  ["factory", createCompleteAppData({ settings: structuredClone(defaultSettings) })],
  ["initial data", initial],
  ["normalisation", normaliseData(legacy, defaultSettings)],
  ["current migration", migrateAppData({ schemaVersion: APP_DATA_SCHEMA_VERSION, data: initial }).data],
  ["previous migration", migrateAppData({ schemaVersion: previousVersion, data: legacy }).data],
  ["backup round-trip", parseBackup(createBackupEnvelope(initial))],
  ["recovery round-trip", recoverySnapshotToData(createRecoverySnapshot(initial, "manual"))],
  ["snapshot payload", createAppDataSnapshot(initial).data],
  ["merge", mergeAppData(initial, createInitialData({ onboarded: true }))],
];

for (const [label, candidate] of candidates) assertCompleteAppData(candidate, label);

const uniqueKeyCount = new Set(APP_DATA_KEYS).size;
if (uniqueKeyCount !== APP_DATA_KEYS.length) throw new Error("AppData contract contains duplicate keys");

console.log(`AppData schema audit passed for v${APP_DATA_SCHEMA_VERSION} across ${candidates.length} paths.`);
