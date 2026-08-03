import { migrateAppData } from "./data/migrations.ts";
import { createAppDataSnapshot } from "./data/snapshot.ts";
import type { AppData } from "./types.ts";

export const RECOVERY_STORAGE_KEY = "saatyar-recovery-snapshot";

export type RecoverySnapshot = {
  savedAt: string;
  reason: "autosave" | "save-failed" | "manual";
  payload: ReturnType<typeof createAppDataSnapshot>;
};

export function createRecoverySnapshot(
  data: AppData,
  reason: RecoverySnapshot["reason"] = "autosave",
  now = new Date(),
): RecoverySnapshot {
  return {
    savedAt: now.toISOString(),
    reason,
    payload: createAppDataSnapshot(data),
  };
}

export function parseRecoverySnapshot(value: unknown): RecoverySnapshot {
  if (!value || typeof value !== "object") throw new Error("Invalid recovery snapshot");
  const candidate = value as Partial<RecoverySnapshot>;
  if (typeof candidate.savedAt !== "string" || !candidate.payload) {
    throw new Error("Invalid recovery snapshot");
  }
  const migrated = migrateAppData(candidate.payload);
  return {
    savedAt: candidate.savedAt,
    reason: candidate.reason === "save-failed" || candidate.reason === "manual" ? candidate.reason : "autosave",
    payload: createAppDataSnapshot(migrated.data),
  };
}

export function recoverySnapshotToData(snapshot: RecoverySnapshot): AppData {
  return migrateAppData(snapshot.payload).data;
}

export function serialiseRecoverySnapshot(snapshot: RecoverySnapshot) {
  return JSON.stringify(snapshot);
}
