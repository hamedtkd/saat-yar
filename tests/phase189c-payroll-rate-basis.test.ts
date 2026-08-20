import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createInitialData, defaultSettings } from "../lib/constants.ts";
import { migrateAppData } from "../lib/data/migrations.ts";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";
import { calculatePayrollWithPolicy } from "../lib/payroll-engine.ts";
import { calculateEmployeeDayPayForSettings } from "../lib/payroll.ts";
import { DEFAULT_STANDARD_MONTH_MINUTES, createPayrollPreset } from "../lib/payroll-policy.ts";

const read = (path: string) => readFileSync(path, "utf8");
const facts = { workedMinutes: 3900, targetMinutes: 3840, overtimeMinutes: 60, deficitMinutes: 0, holidayMinutes: 0, components: [] };

test("monthly payroll defaults to a 220-hour standard month for derived hourly rates", () => {
  assert.equal(defaultSettings.payrollPolicy.rateBasis, "standard-month");
  assert.equal(defaultSettings.payrollPolicy.standardMonthMinutes, 220 * 60);
  const policy = createPayrollPreset("monthly-fixed", 30_000_000);
  const result = calculatePayrollWithPolicy(policy, facts);
  assert.equal(Math.round(result.baseMinuteRate * 60), 136_364);
  assert.equal(result.overtimePay, 190_909);
});

test("period-target remains an explicit opt-in hourly-rate basis", () => {
  const policy = createPayrollPreset("monthly-fixed", 30_000_000);
  policy.rateBasis = "period-target";
  const result = calculatePayrollWithPolicy(policy, facts);
  assert.equal(Math.round(result.baseMinuteRate * 60), 468_750);
  assert.equal(result.overtimePay, 656_250);
});

test("standard-month rate also drives holiday and deficit calculations", () => {
  const policy = createPayrollPreset("monthly-fixed", 30_000_000);
  const result = calculatePayrollWithPolicy(policy, {
    workedMinutes: 60,
    targetMinutes: 3840,
    overtimeMinutes: 0,
    deficitMinutes: 60,
    holidayMinutes: 60,
    components: [],
  });
  assert.equal(result.holidayPay, 190_909);
  assert.equal(result.deficitDeduction, 136_364);
});

test("Today payroll keeps daily base pay but uses the configured monthly rate for overtime", () => {
  const settings = structuredClone(defaultSettings);
  settings.payrollPolicy.baseAmount = 30_000_000;
  settings.payrollPolicy.rateBasis = "standard-month";
  settings.payrollPolicy.standardMonthMinutes = 220 * 60;
  const pay = calculateEmployeeDayPayForSettings({ settings, creditedMinutes: 540, dailyTargetMinutes: 480 });
  assert.equal(pay, 1_190_909);
});

test("schema v20 migrates existing v19 payroll policy to the safe standard-month basis", () => {
  assert.ok(APP_DATA_SCHEMA_VERSION >= 20);
  const previous = structuredClone(createInitialData({ onboarded: true })) as unknown as { settings: { payrollPolicy: Record<string, unknown> } };
  delete previous.settings.payrollPolicy.rateBasis;
  delete previous.settings.payrollPolicy.standardMonthMinutes;
  const migrated = migrateAppData({ schemaVersion: 19, data: previous }).data;
  assert.equal(migrated.settings.payrollPolicy.rateBasis, "standard-month");
  assert.equal(migrated.settings.payrollPolicy.standardMonthMinutes, DEFAULT_STANDARD_MONTH_MINUTES);
});

test("backup schema persists hourly-rate basis and standard monthly minutes", () => {
  const backup = read("lib/backup-schema.ts");
  assert.match(backup, /rateBasis: z\.enum\(\["standard-month", "period-target"\]\)/);
  assert.match(backup, /standardMonthMinutes: z\.number\(\)\.int\(\)\.positive\(\)/);
});

test("payroll settings expose the rate-basis selector, standard monthly hours, and live derived rates", () => {
  const controls = read("components/pages/settings/payroll-policy-controls.tsx");
  const preview = read("components/pages/settings/payroll-policy-preview.tsx");
  assert.match(controls, /data-payroll-rate-basis/);
  assert.match(controls, /standard-month/);
  assert.match(controls, /period-target/);
  assert.match(controls, /standardMonthMinutes \/ 60/);
  assert.match(preview, /data-payroll-rate-preview/);
  assert.match(preview, /Base hourly rate/);
  assert.match(preview, /Overtime hourly rate/);
});

test("Phase 189C documents the formula fix and stays wired into the quality command", () => {
  const notes = read("docs/phases/PHASE_189C_NOTES_FA.md");
  const backlog = read("docs/roadmap/BACKLOG_FA.md");
  const features = read("docs/releases/NEXT_RELEASE_FEATURES_FA.md");
  const pkg = JSON.parse(read("package.json")) as { scripts: { test: string } };
  const browser = read("scripts/production-browser-smoke.mjs");
  assert.match(notes, /۳۰,۰۰۰,۰۰۰[\s\S]*۲۲۰[\s\S]*۱\.۴/);
  assert.match(notes, /Schema v20/);
  assert.match(backlog, /فاز ۱۸۹C/);
  assert.match(features, /Phase 189C/);
  assert.match(browser, /English standard-month payroll rate basis/);
  assert.match(browser, /Payroll settings default monthly hourly rates to a configurable standard-month basis/);
  assert.match(pkg.scripts.test, /phase189c-payroll-rate-basis\.test\.ts/);
});
