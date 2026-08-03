import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const controllerFiles = [
  "hooks/use-saatyar-controller.ts",
  "hooks/controller/use-controller-derived.ts",
  "hooks/controller/use-attendance-actions.ts",
  "hooks/controller/use-business-actions.ts",
  "hooks/controller/use-backup-actions.ts",
  "hooks/controller/use-report-actions.ts",
  "hooks/controller/use-notification-reminders.ts",
];

test("controller modules stay below 250 lines", () => {
  for (const file of controllerFiles) {
    const source = readFileSync(new URL(file, root), "utf8");
    const lines = source.split(/\r?\n/).length;
    assert.ok(lines <= 250, `${file} has ${lines} lines`);
  }
});

test("controller facade delegates domain logic to focused hooks", () => {
  const source = readFileSync(new URL("hooks/use-saatyar-controller.ts", root), "utf8");
  for (const hook of [
    "useControllerDerived", "useAttendanceActions", "useBusinessActions",
    "useBackupActions", "useReportActions", "useNotificationReminders",
  ]) assert.match(source, new RegExp(`${hook}\\(`));
  assert.ok(source.split(/\r?\n/).length < 150);
});
