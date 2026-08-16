import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { defaultSettings } from "../lib/constants.ts";
import { calculateMonthlyPayrollForSettings } from "../lib/payroll.ts";
import { derivePayrollPeriodFacts, getPayrollRateSummary } from "../lib/payroll-period.ts";
import { createPayrollPreset } from "../lib/payroll-policy.ts";
import { makeWorkRecord } from "./fixtures/work-record.ts";

function settingsWithEightHourDays() {
  const settings = structuredClone(defaultSettings);
  for (const day of Object.values(settings.weeklySchedule)) {
    day.enabled = true;
    day.targetMinutes = 480;
  }
  settings.payrollComponents = [];
  return settings;
}

const read = (path: string) => readFileSync(path, "utf8");

test("holiday work stays separate and cannot hide a regular-day deficit", () => {
  const settings = settingsWithEightHourDays();
  const records = [
    makeWorkRecord({ date: "2026-08-10", start: "08:00", end: "15:00" }),
    makeWorkRecord({ date: "2026-08-11", start: "08:00", end: "16:00", holiday: true }),
  ];

  const facts = derivePayrollPeriodFacts(records, settings);
  assert.equal(facts.holidayMinutes, 480);
  assert.equal(facts.deficitMinutes, 60);
  assert.equal(facts.overtimeMinutes, 0);
  assert.equal(facts.regularBalanceMinutes, -60);
});

test("regular overtime and deficit net within the period without holiday contamination", () => {
  const settings = settingsWithEightHourDays();
  const records = [
    makeWorkRecord({ date: "2026-08-10", start: "08:00", end: "17:00" }),
    makeWorkRecord({ date: "2026-08-11", start: "08:00", end: "15:00" }),
  ];

  const facts = derivePayrollPeriodFacts(records, settings);
  assert.equal(facts.regularBalanceMinutes, 0);
  assert.equal(facts.overtimeMinutes, 0);
  assert.equal(facts.deficitMinutes, 0);
});

test("paid leave is credited consistently for period payroll just like Today", () => {
  const settings = settingsWithEightHourDays();
  const facts = derivePayrollPeriodFacts([
    makeWorkRecord({ date: "2026-08-10", start: "", end: "", leaveType: "full" }),
  ], settings);

  assert.equal(facts.actualWorkedMinutes, 0);
  assert.equal(facts.creditedMinutes, 480);
  assert.equal(facts.workedMinutes, 480);
  assert.equal(facts.deficitMinutes, 0);
});

test("one period fact set drives standard-month holiday and deficit money", () => {
  const settings = settingsWithEightHourDays();
  settings.payrollPolicy = createPayrollPreset("monthly-fixed", 30_000_000);
  settings.payrollPolicy.standardMonthMinutes = 220 * 60;
  const facts = derivePayrollPeriodFacts([
    makeWorkRecord({ date: "2026-08-10", start: "08:00", end: "15:00" }),
    makeWorkRecord({ date: "2026-08-11", start: "08:00", end: "16:00", holiday: true }),
  ], settings);
  const payroll = calculateMonthlyPayrollForSettings(settings, facts);

  assert.equal(payroll.holidayPay, 1_527_273);
  assert.equal(payroll.deficitDeduction, 136_364);
});

test("rate summary respects fixed premium rates and deficit multiplier", () => {
  const policy = createPayrollPreset("hourly", 300_000);
  policy.overtime = { mode: "fixed-hourly", multiplier: 0, hourlyRate: 500_000 };
  policy.holiday = { mode: "ignore", multiplier: 0, hourlyRate: 0 };
  policy.deficit = { mode: "deduct", multiplier: 0.5 };
  const rates = getPayrollRateSummary(policy, { targetMinutes: 480 });

  assert.equal(rates.baseHourlyRate, 300_000);
  assert.equal(rates.overtimeHourlyRate, 500_000);
  assert.equal(rates.holidayHourlyRate, 0);
  assert.equal(rates.deficitHourlyRate, 150_000);
});

test("Reports and payroll preview consume the shared period facts engine", () => {
  assert.match(read("components/pages/reports/overview/use-report-summary.ts"), /derivePayrollPeriodFacts/);
  assert.match(read("lib/payroll-preview.ts"), /derivePayrollPeriodFacts/);
});

test("Phase 191 is documented and stays in the main quality command", () => {
  const pkg = JSON.parse(read("package.json")) as { scripts: { test: string } };
  assert.match(pkg.scripts.test, /phase191-payroll-reports-hardening\.test\.ts/);
  assert.match(read("docs/phases/PHASE_191_NOTES_FA.md"), /Single Source of Truth/);
  assert.match(read("docs/roadmap/BACKLOG_FA.md"), /فاز ۱۹۱/);
});
