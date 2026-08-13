import assert from "node:assert/strict";
import test from "node:test";
import { createInitialData } from "../lib/constants.ts";
import { migrateAppData } from "../lib/data/migrations.ts";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";
import { activeDeletedRecords, createDeletedWorkRecord, permanentlyDeleteRecord, restoreDeletedRecord } from "../lib/record-recycle-bin.ts";
import { makeWorkRecord } from "./fixtures/work-record.ts";

const now = new Date("2026-08-06T10:00:00.000Z");

test("schema v16 adds a persistent deleted record collection", () => {
  const migrated = migrateAppData({ schemaVersion: 15, data: createInitialData({ onboarded: true }) });
  assert.equal(APP_DATA_SCHEMA_VERSION, 18);
  assert.deepEqual(migrated.data.deletedRecords, []);
});

test("deleted records remain recoverable for thirty days", () => {
  const record = makeWorkRecord({ date: "2026-08-05" });
  const deleted = createDeletedWorkRecord(record.date, record, now, "deleted-1");
  assert.equal(deleted.id, "deleted-1");
  assert.equal(activeDeletedRecords([deleted], new Date("2026-08-20T10:00:00.000Z")).length, 1);
  assert.equal(activeDeletedRecords([deleted], new Date("2026-09-06T10:00:01.000Z")).length, 0);
});

test("restore removes the recycle item without overwriting an active record", () => {
  const record = makeWorkRecord({ date: "2026-08-05" });
  const deleted = createDeletedWorkRecord(record.date, record, now, "deleted-1");
  const data = { ...createInitialData(), deletedRecords: [deleted] };
  const restored = restoreDeletedRecord(data, deleted.id);
  assert.equal(restored.records[record.date]?.start, "08:00");
  assert.equal(restored.deletedRecords.length, 0);

  const blocked = restoreDeletedRecord({ ...data, records: { [record.date]: record } }, deleted.id);
  assert.equal(blocked.deletedRecords.length, 1);
});

test("permanent deletion only removes the selected recycle entry", () => {
  const record = makeWorkRecord({ date: "2026-08-05" });
  const one = createDeletedWorkRecord(record.date, record, now, "one");
  const two = createDeletedWorkRecord("2026-08-04", { ...record, date: "2026-08-04" }, now, "two");
  const next = permanentlyDeleteRecord({ ...createInitialData(), deletedRecords: [one, two] }, "one");
  assert.deepEqual(next.deletedRecords.map((item) => item.id), ["two"]);
});
