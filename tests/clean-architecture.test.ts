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


test("layout components stay below 250 lines", () => {
  for (const file of [
    "components/layout/app-header.tsx",
    "components/layout/app-header/header-nav.tsx",
    "components/layout/app-header/header-actions.tsx",
    "components/layout/app-header/workspace-switcher.tsx",
  ]) {
    const source = readFileSync(new URL(file, root), "utf8");
    assert.ok(source.split(/\r?\n/).length <= 250, `${file} exceeds 250 lines`);
  }
});

test("danger zone resets through the complete AppData factory", () => {
  const source = readFileSync(new URL("components/pages/settings/danger-zone.tsx", root), "utf8");
  assert.match(source, /createInitialData\(\{ onboarded: true \}\)/);
  assert.doesNotMatch(source, /records:\s*\{\}/);
});

test("report table modules stay below 250 lines", () => {
  for (const file of [
    "components/pages/reports/report-table.tsx",
    "components/pages/reports/table/employee-desktop-table.tsx",
    "components/pages/reports/table/employee-mobile-cards.tsx",
    "components/pages/reports/table/employee-report-table.tsx",
    "components/pages/reports/table/freelancer-desktop-table.tsx",
    "components/pages/reports/table/freelancer-mobile-cards.tsx",
    "components/pages/reports/table/freelancer-report-table.tsx",
    "components/pages/reports/table/print-preview-aside.tsx",
    "components/pages/reports/table/report-table-shared.tsx",
  ]) {
    const source = readFileSync(new URL(file, root), "utf8");
    assert.ok(source.split(/\r?\n/).length <= 250, `${file} exceeds 250 lines`);
  }
});

test("report table facade delegates employee and freelancer rendering", () => {
  const source = readFileSync(new URL("components/pages/reports/report-table.tsx", root), "utf8");
  assert.match(source, /<EmployeeReportTable/);
  assert.match(source, /<FreelancerReportTable/);
  assert.match(source, /<PrintPreviewAside/);
  assert.ok(source.split(/\r?\n/).length < 80);
});
