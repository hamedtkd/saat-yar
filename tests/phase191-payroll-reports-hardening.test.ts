import assert from "node:assert/strict";
import test from "node:test";
import { createInitialData, defaultSettings } from "../lib/constants.ts";
import { calculateMonthlyPayrollForSettings } from "../lib/payroll.ts";
import { createPayrollPreview } from "../lib/payroll-preview.ts";
import { createReportSummary } from "../lib/report-summary.ts";
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

test("Reports and payroll preview agree on period compensation behavior", () => {
  const data = createInitialData({ onboarded: true });
  data.settings = settingsWithEightHourDays();
  data.records["2026-08-10"] = makeWorkRecord({ date: "2026-08-10", start: "08:00", end: "15:00" });
  data.records["2026-08-11"] = makeWorkRecord({ date: "2026-08-11", start: "08:00", end: "16:00", holiday: true });
  const records = Object.values(data.records);
  const report = createReportSummary({
    data,
    monthRecords: records,
    monthStats: { worked: 0, target: 0, balance: 0, breaks: 0 },
    entries: [],
    reportBillable: 0,
  });
  const preview = createPayrollPreview(data, new Date("2026-08-20T12:00:00Z"));

  assert.equal(report.deficitMinutes, 60);
  assert.equal(report.overtimeMinutes, 0);
  assert.equal(preview.facts.deficitMinutes, report.deficitMinutes);
  assert.equal(preview.facts.overtimeMinutes, report.overtimeMinutes);
});

test("Phase 191 shared engine remains callable without UI source inspection", () => {
  const settings = settingsWithEightHourDays();
  const facts = derivePayrollPeriodFacts([], settings);
  assert.deepEqual(
    { overtime: facts.overtimeMinutes, deficit: facts.deficitMinutes, holiday: facts.holidayMinutes },
    { overtime: 0, deficit: 0, holiday: 0 },
  );
});
