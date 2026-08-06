import { createBackupEnvelope, parseBackupEnvelope } from "../lib/backup-workflow.ts";
import { createInitialData, defaultSettings } from "../lib/constants.ts";
import {
  formatAppDataAuditExecutionError,
  formatAppDataAuditFailure,
  hasAppDataContractDiff,
  inspectAppDataContract,
} from "../lib/data/app-data-audit.ts";
import { APP_DATA_KEYS } from "../lib/data/app-data-contract.ts";
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

type AuditPath = {
  label: string;
  create: () => unknown;
};

const paths: AuditPath[] = [
  { label: "factory", create: () => createCompleteAppData({ settings: structuredClone(defaultSettings) }) },
  { label: "initial data", create: () => initial },
  { label: "normalisation", create: () => normaliseData(legacy, defaultSettings) },
  {
    label: "current migration",
    create: () => migrateAppData({ schemaVersion: APP_DATA_SCHEMA_VERSION, data: initial }).data,
  },
  {
    label: "previous migration",
    create: () => migrateAppData({ schemaVersion: previousVersion, data: legacy }).data,
  },
  { label: "backup round-trip", create: () => parseBackupEnvelope(createBackupEnvelope(initial)) },
  {
    label: "recovery round-trip",
    create: () => recoverySnapshotToData(createRecoverySnapshot(initial, "manual")),
  },
  { label: "snapshot payload", create: () => createAppDataSnapshot(initial).data },
  { label: "merge", create: () => mergeAppData(initial, createInitialData({ onboarded: true })) },
];

const failures: string[] = [];
for (const path of paths) {
  try {
    const diff = inspectAppDataContract(path.create());
    if (hasAppDataContractDiff(diff)) {
      failures.push(formatAppDataAuditFailure(path.label, APP_DATA_SCHEMA_VERSION, diff));
    }
  } catch (error) {
    failures.push(formatAppDataAuditExecutionError(path.label, APP_DATA_SCHEMA_VERSION, error));
  }
}

if (new Set(APP_DATA_KEYS).size !== APP_DATA_KEYS.length) {
  failures.push(formatAppDataAuditExecutionError(
    "contract key registry",
    APP_DATA_SCHEMA_VERSION,
    new Error("AppData contract contains duplicate keys"),
  ));
}

if (failures.length > 0) {
  console.error(failures.join("\n\n----------------------------------------\n\n"));
  process.exitCode = 1;
} else {
  console.log(`AppData schema audit passed for v${APP_DATA_SCHEMA_VERSION} across ${paths.length} paths.`);
}
