import assert from "node:assert/strict";
import test from "node:test";
import { createInitialData } from "../lib/constants.ts";
import {
  createDeletedWorkRecord, expiredDeletedRecords, purgeExpiredDeletedRecords,
  restoreAllDeletedRecords,
} from "../lib/record-recycle-bin.ts";
import { makeWorkRecord } from "./fixtures/work-record.ts";

const now = new Date("2026-08-06T10:00:00.000Z");

function deleted(date: string, id: string, deletedAt = now) {
  return createDeletedWorkRecord(date, makeWorkRecord({ date }), deletedAt, id);
}

test("bulk restore returns every active unblocked record and keeps conflicts", () => {
  const first = deleted("2026-08-05", "first");
  const second = deleted("2026-08-04", "second");
  const blocked = deleted("2026-08-03", "blocked");
  const expired = deleted("2026-06-01", "expired", new Date("2026-06-01T10:00:00.000Z"));
  const activeRecord = makeWorkRecord({ date: blocked.date, start: "09:00" });
  const data = {
    ...createInitialData(),
    records: { [blocked.date]: activeRecord },
    deletedRecords: [blocked, expired, second, first],
  };

  const result = restoreAllDeletedRecords(data, now);

  assert.equal(result.restoredCount, 2);
  assert.equal(result.blockedCount, 1);
  assert.equal(result.data.records[first.date]?.start, "08:00");
  assert.equal(result.data.records[second.date]?.start, "08:00");
  assert.equal(result.data.records[blocked.date]?.start, "09:00");
  assert.deepEqual(result.data.deletedRecords.map((item) => item.id), ["blocked", "expired"]);
});

test("bulk restore prefers the newest deleted snapshot for duplicate dates", () => {
  const older = createDeletedWorkRecord(
    "2026-08-05",
    makeWorkRecord({ date: "2026-08-05", start: "07:30" }),
    new Date("2026-08-06T08:00:00.000Z"),
    "older",
  );
  const newer = createDeletedWorkRecord(
    "2026-08-05",
    makeWorkRecord({ date: "2026-08-05", start: "09:15" }),
    new Date("2026-08-06T09:00:00.000Z"),
    "newer",
  );

  const result = restoreAllDeletedRecords({ ...createInitialData(), deletedRecords: [older, newer] }, now);

  assert.equal(result.restoredCount, 1);
  assert.equal(result.blockedCount, 1);
  assert.equal(result.data.records["2026-08-05"]?.start, "09:15");
  assert.deepEqual(result.data.deletedRecords.map((item) => item.id), ["older"]);
});

test("expired cleanup removes only records whose retention window ended", () => {
  const active = deleted("2026-08-05", "active");
  const expired = deleted("2026-06-01", "expired", new Date("2026-06-01T10:00:00.000Z"));
  const invalid = { ...deleted("2026-08-02", "invalid"), expiresAt: "not-a-date" };
  const data = { ...createInitialData(), deletedRecords: [active, expired, invalid] };

  assert.deepEqual(expiredDeletedRecords(data.deletedRecords, now).map((item) => item.id).sort(), ["expired", "invalid"]);
  const result = purgeExpiredDeletedRecords(data, now);
  assert.equal(result.removedCount, 2);
  assert.deepEqual(result.data.deletedRecords.map((item) => item.id), ["active"]);
});

test("bulk operations keep source data immutable and clone restored breaks", () => {
  const source = deleted("2026-08-05", "source");
  const data = { ...createInitialData(), deletedRecords: [source] };

  const result = restoreAllDeletedRecords(data, now);

  assert.equal(data.records[source.date], undefined);
  assert.deepEqual(data.deletedRecords.map((item) => item.id), ["source"]);
  assert.notEqual(result.data.records[source.date]?.breaks, source.record.breaks);
});
