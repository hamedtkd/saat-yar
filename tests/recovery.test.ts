import assert from "node:assert/strict";
import test from "node:test";
import { initialData } from "../lib/constants.ts";
import {
  createRecoverySnapshot,
  parseRecoverySnapshot,
  recoverySnapshotToData,
  serialiseRecoverySnapshot,
} from "../lib/recovery.ts";

test("creates a versioned recovery snapshot", () => {
  const snapshot = createRecoverySnapshot(initialData, "manual", new Date("2026-08-03T10:00:00.000Z"));
  assert.equal(snapshot.savedAt, "2026-08-03T10:00:00.000Z");
  assert.equal(snapshot.reason, "manual");
  assert.ok(snapshot.payload.schemaVersion >= 1);
});

test("round-trips recovery data", () => {
  const source = {
    ...initialData,
    settings: { ...initialData.settings, name: "هامد" },
  };
  const parsed = parseRecoverySnapshot(JSON.parse(serialiseRecoverySnapshot(createRecoverySnapshot(source))));
  assert.equal(recoverySnapshotToData(parsed).settings.name, "هامد");
});

test("rejects malformed recovery snapshots", () => {
  assert.throws(() => parseRecoverySnapshot({ savedAt: "2026-08-03" }));
});
