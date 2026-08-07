import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { defaultSettings } from "../lib/constants.ts";
import { migrateAppData } from "../lib/data/migrations.ts";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";
import { calculateMonthlyPayrollForSettings } from "../lib/payroll.ts";
import { createPayrollPreset } from "../lib/payroll-policy.ts";

const read = (path: string) => readFileSync(path, "utf8");

test("schema v17 persists a payroll policy while migrating released v16 data", () => {
  assert.equal(APP_DATA_SCHEMA_VERSION, 17);
  const legacy = { ...defaultSettings, payrollPolicy: undefined };
  const migrated = migrateAppData({ schemaVersion: 16, data: { settings: legacy, records: {}, leaves: [], clients: [], projects: [], timeEntries: [], expenses: [], invoices: [], holidayOverrides: [], deletedRecords: [] } }).data;
  assert.equal(migrated.settings.payrollPolicy.baseMode, "monthly-prorated");
  assert.equal(migrated.settings.payrollPolicy.baseAmount, defaultSettings.salary);
});

test("custom hourly policy is used by the settings-aware monthly payroll facade", () => {
  const settings = { ...defaultSettings, payrollPolicy: createPayrollPreset("hourly", 200_000), payrollComponents: [] };
  const payroll = calculateMonthlyPayrollForSettings(settings, { workedMinutes: 10 * 60, targetMinutes: 10 * 60, overtimeMinutes: 0, deficitMinutes: 0, holidayMinutes: 0 });
  assert.equal(payroll.regularPay, 2_000_000);
});

test("settings exposes a dedicated policy editor with live preview and draft actions", () => {
  const page = read("components/pages/settings/settings-page.tsx");
  const card = read("components/pages/settings/payroll-policy-card.tsx");
  assert.match(page, /PayrollPolicyCard/);
  assert.match(card, /useSettingsDraft/);
  assert.match(card, /PayrollPolicyPreview/);
  assert.match(card, /validatePayrollPolicy/);
});

test("reports and today use the persisted payroll policy instead of legacy fixed fields", () => {
  assert.match(read("components/pages/reports/overview/use-report-summary.ts"), /calculateMonthlyPayrollForSettings/);
  assert.match(read("components/pages/reports/table/report-table-shared.tsx"), /calculateEmployeeDayPayForSettings/);
  assert.match(read("components/pages/today/today-metrics.tsx"), /calculateEmployeeDayPayForSettings/);
});

test("backup contract validates the migrated payroll policy", () => {
  const backup = read("lib/backup-schema.ts");
  assert.match(backup, /const payrollPolicySchema/);
  assert.match(backup, /payrollPolicy: payrollPolicySchema/);
});

test("released 2.1.0 manifest remains historical while the active release advances to v17", () => {
  const audit = read("scripts/release-audit.mjs");
  const historicalManifest = JSON.parse(read("docs/releases/2.1.0.json"));
  const activeManifest = JSON.parse(read("docs/releases/2.2.0.json"));
  assert.equal(historicalManifest.dataSchemaVersion, 16);
  assert.equal(activeManifest.dataSchemaVersion, 17);
  assert.match(audit, /docs\/releases\/2\.2\.0\.json/);
  assert.match(audit, /APP_DATA_SCHEMA_VERSION === manifest\.dataSchemaVersion/);
});

test("stale roadmap tests no longer hard-code future phase numbering", () => {
  assert.doesNotMatch(read("tests/phase105-pwa-identity-roadmap.test.ts"), /فاز ۱۱۰: طراحی قرارداد/);
  assert.doesNotMatch(read("tests/phase110-pwa-media-hardening.test.ts"), /فاز ۱۱۱: طراحی قرارداد و Schema/);
});

test("phase 112 contract is part of the main quality command", () => {
  const packageJson = JSON.parse(read("package.json"));
  assert.match(packageJson.scripts.test, /tests\/phase112-payroll-policy-settings-schema\.test\.ts/);
});
