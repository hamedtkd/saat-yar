import assert from "node:assert/strict";
import test from "node:test";
import { createBackupEnvelope, parseBackupEnvelope } from "../lib/backup-workflow.ts";
import { createInitialData } from "../lib/constants.ts";
import { APP_DATA_KEYS, pickAppData } from "../lib/data/app-data-contract.ts";
import { inspectAppDataContract } from "../lib/data/app-data-audit.ts";
import { makeWorkRecord } from "./fixtures/work-record.ts";

test("backup envelope parsing returns only the AppData payload", () => {
  const source = createInitialData({ onboarded: true });
  source.records["2026-08-06"] = makeWorkRecord();

  const restored = parseBackupEnvelope(createBackupEnvelope(source, "2026-08-06T10:00:00.000Z"));

  assert.deepEqual(Object.keys(restored).sort(), [...APP_DATA_KEYS].sort());
  assert.equal("appName" in restored, false);
  assert.equal("schemaVersion" in restored, false);
  assert.equal("exportedAt" in restored, false);
  assert.deepEqual(inspectAppDataContract(restored), {
    missing: [],
    unexpected: [],
    invalid: [],
  });
});

test("AppData picker strips transport metadata without mutating collections", () => {
  const source = createInitialData({ onboarded: true });
  const extended = {
    ...source,
    appName: "ساعت‌یار",
    schemaVersion: 16,
    exportedAt: "2026-08-06T10:00:00.000Z",
  };

  const picked = pickAppData(extended);
  assert.deepEqual(Object.keys(picked).sort(), [...APP_DATA_KEYS].sort());
  assert.equal(picked.settings, source.settings);
  assert.equal(picked.records, source.records);
});

test("shared WorkRecord fixture supports domain-specific test overrides", () => {
  const record = makeWorkRecord({
    date: "2026-08-05",
    end: "",
    lunchMinutes: 45,
    startedAt: "2026-08-05T08:00:00.000Z",
  });

  assert.equal(record.date, "2026-08-05");
  assert.equal(record.end, "");
  assert.equal(record.lunchMinutes, 45);
  assert.equal(record.startedAt, "2026-08-05T08:00:00.000Z");
  assert.equal(record.lunchPaid, false);
});
