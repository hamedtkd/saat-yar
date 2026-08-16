import assert from "node:assert/strict";
import test from "node:test";
import { calculatePayrollWithPolicy } from "../lib/payroll-engine.ts";
import {
  createLegacyPayrollPolicy,
  createPayrollPreset,
  normalizePayrollPolicy,
  roundPayrollAmount,
  validatePayrollPolicy,
} from "../lib/payroll-policy.ts";

const facts = {
  workedMinutes: 9_900,
  targetMinutes: 10_000,
  overtimeMinutes: 0,
  deficitMinutes: 100,
  holidayMinutes: 0,
  components: [],
};

test("legacy payroll policy preserves the released monthly calculation", () => {
  const result = calculatePayrollWithPolicy(createLegacyPayrollPolicy({
    monthlySalary: 30_000_000,
    overtimeMultiplier: 1.4,
    holidayMultiplier: 1.4,
  }), facts);

  assert.equal(result.regularPay, 29_700_000);
  assert.equal(result.deficitDeduction, 300_000);
  assert.equal(result.net, 29_400_000);
});

test("fixed monthly policy can keep the base salary independent from attendance", () => {
  const policy = createPayrollPreset("monthly-fixed", 30_000_000);
  policy.rateBasis = "period-target";
  const result = calculatePayrollWithPolicy(policy, facts);

  assert.equal(result.regularPay, 30_000_000);
  assert.equal(result.deficitDeduction, 300_000);
  assert.equal(result.net, 29_700_000);
});

test("hourly policy supports fixed overtime rates and ignoring deficit", () => {
  const policy = createPayrollPreset("hourly", 300_000);
  policy.overtime = { mode: "fixed-hourly", multiplier: 0, hourlyRate: 500_000 };
  policy.deficit.mode = "ignore";
  const result = calculatePayrollWithPolicy(policy, {
    workedMinutes: 600,
    targetMinutes: 600,
    overtimeMinutes: 120,
    deficitMinutes: 60,
    holidayMinutes: 0,
    components: [],
  });

  assert.equal(result.regularPay, 2_400_000);
  assert.equal(result.overtimePay, 1_000_000);
  assert.equal(result.deficitDeduction, 0);
  assert.equal(result.net, 3_400_000);
});

test("daily policy supports fractional work days", () => {
  const policy = createPayrollPreset("daily", 1_000_000);
  policy.standardDayMinutes = 480;
  policy.overtime.mode = "ignore";
  policy.holiday.mode = "ignore";
  policy.deficit.mode = "ignore";
  const result = calculatePayrollWithPolicy(policy, {
    workedMinutes: 720,
    targetMinutes: 960,
    overtimeMinutes: 0,
    deficitMinutes: 240,
    holidayMinutes: 0,
    components: [],
  });

  assert.equal(result.regularPay, 1_500_000);
});

test("custom policy can round payroll lines to an organization-specific increment", () => {
  assert.equal(roundPayrollAmount(1_234_499, { mode: "nearest", increment: 1_000 }), 1_234_000);
  assert.equal(roundPayrollAmount(1_234_501, { mode: "ceil", increment: 1_000 }), 1_235_000);
});

test("policy normalization and validation make future settings editing safe", () => {
  const policy = createPayrollPreset("monthly-prorated", 30_000_000);
  policy.title = "   ";
  policy.standardDayMinutes = 0;
  assert.match(validatePayrollPolicy(policy) ?? "", /عنوان/);

  policy.title = "  قرارداد شرکت  ";
  const normalized = normalizePayrollPolicy(policy);
  assert.equal(normalized.title, "قرارداد شرکت");
  assert.equal(normalized.standardDayMinutes, 480);
  assert.equal(validatePayrollPolicy(normalized), null);
});

test("payroll result exposes a stable explainable breakdown for the next UI phase", () => {
  const policy = createPayrollPreset("monthly-fixed", 20_000_000);
  const result = calculatePayrollWithPolicy(policy, {
    workedMinutes: 10_000,
    targetMinutes: 10_000,
    overtimeMinutes: 0,
    deficitMinutes: 0,
    holidayMinutes: 0,
    components: [{ id: "bonus", title: "پاداش", amount: 2_000_000, type: "earning" }],
  });

  assert.deepEqual(result.breakdown.map((line) => line.key), ["base", "overtime", "holiday", "earning", "deficit", "deduction"]);
  assert.equal(result.net, 22_000_000);
});

test("phase 111 payroll engine contract is part of the main quality command", async () => {
  const { readFile } = await import("node:fs/promises");
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8")) as { scripts: { test: string } };
  assert.match(pkg.scripts.test, /phase111-custom-payroll-engine\.test\.ts/);
});
