import assert from "node:assert/strict";
import test from "node:test";
import { migrateAppData } from "../lib/data/migrations.ts";
import { createAppDataSnapshot } from "../lib/data/snapshot.ts";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";

const legacyV1 = {
  settings: {
    name: "کاربر قدیمی",
    onboarded: true,
    weeklyMinutes: 2550,
    workDays: 5,
    defaultStart: "07:30",
    defaultEnd: "16:15",
    lunchMinutes: 45,
    leaveBalanceMinutes: 0,
    monthlyLeaveMinutes: 0,
    salary: 30_000_000,
    overtimeMultiplier: 1.4,
    holidayMultiplier: 1.4,
  },
  records: {
    "2026-08-03": {
      date: "2026-08-03",
      start: "08:00",
      end: "16:00",
      lunchMinutes: 30,
      breaks: [{ id: "b1", start: "10:00", end: "10:10", title: "استراحت" }],
      leaveMinutes: 0,
      leaveType: "none",
      note: "",
    },
  },
};

test("migrates unversioned legacy data to the current schema", () => {
  const result = migrateAppData(legacyV1);

  assert.equal(result.fromVersion, 1);
  assert.equal(result.toVersion, APP_DATA_SCHEMA_VERSION);
  assert.equal(result.migrated, true);
  assert.equal(result.data.settings.mode, "employee");
  assert.equal(result.data.settings.autoOfficialHolidays, true);
  assert.equal(result.data.settings.autoWeeklyHoliday, true);
  assert.equal(result.data.settings.weeklySchedule.saturday.enabled, true);
  assert.equal(result.data.settings.weeklySchedule.thursday.enabled, false);
  assert.equal(result.data.settings.weeklySchedule.friday.enabled, false);
  assert.equal(result.data.records["2026-08-03"].lunchPaid, false);
  assert.equal(result.data.records["2026-08-03"].breaks[0].paid, false);
  assert.equal(result.data.records["2026-08-03"].holiday, false);
  assert.equal(result.data.records["2026-08-03"].manuallyEdited, false);
  assert.deepEqual(result.data.clients, []);
});

test("loads a current storage snapshot without remigrating it", () => {
  const migrated = migrateAppData(legacyV1).data;
  const snapshot = createAppDataSnapshot(migrated, "2026-08-03T08:00:00.000Z");
  const result = migrateAppData(snapshot);

  assert.equal(result.fromVersion, APP_DATA_SCHEMA_VERSION);
  assert.equal(result.migrated, false);
  assert.equal(result.data.settings.name, "کاربر قدیمی");
});

test("rejects backups from a newer unsupported schema", () => {
  assert.throws(
    () => migrateAppData({ schemaVersion: APP_DATA_SCHEMA_VERSION + 1, data: legacyV1 }),
    /newer than supported/,
  );
});
