import assert from "node:assert/strict";
import test from "node:test";
import { isValidAppData, parseBackup } from "../lib/backup-schema.ts";

const validBackup = {
  appName: "ساعت‌یار",
  schemaVersion: 3,
  exportedAt: "2026-07-28T10:00:00.000Z",
  settings: {
    name: "حامد",
    onboarded: true,
    weeklyMinutes: 2400,
    workDays: 5,
    defaultStart: "07:30",
    defaultEnd: "16:15",
    lunchMinutes: 45,
    leaveBalanceMinutes: 9600,
    monthlyLeaveMinutes: 0,
    salary: 0,
    overtimeMultiplier: 1.4,
    holidayMultiplier: 1.4,
    mode: "hybrid",
  },
  records: {},
  leaves: [],
  clients: [],
  projects: [],
  timeEntries: [],
};

test("accepts a versioned Saatyar backup", () => {
  assert.equal(isValidAppData(validBackup), true);
  assert.equal(parseBackup(validBackup).schemaVersion, 5);
});



test("parses backups wrapped in a data envelope", () => {
  const parsed = parseBackup({
    appName: "ساعت‌یار",
    schemaVersion: 3,
    exportedAt: "2026-07-28T10:00:00.000Z",
    data: validBackup,
  });

  assert.equal(parsed.settings.name, "حامد");
  assert.equal(isValidAppData(parsed), true);
});

test("rejects backups without required settings", () => {
  assert.equal(isValidAppData({ records: {} }), false);
});

test("rejects invalid working-day ranges", () => {
  assert.equal(
    isValidAppData({
      ...validBackup,
      settings: { ...validBackup.settings, workDays: 9 },
    }),
    false,
  );
});
