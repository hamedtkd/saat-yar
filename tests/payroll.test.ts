import assert from "node:assert/strict";
import test from "node:test";
import { calculateEmployeeDayPay, dailyBaseSalary } from "../lib/payroll.ts";

test("daily base salary is monthly salary divided by 30", () => {
  assert.equal(dailyBaseSalary(30_000_000), 1_000_000);
});

test("a complete regular day earns exactly one daily salary", () => {
  assert.equal(calculateEmployeeDayPay({
    monthlySalary: 30_000_000,
    creditedMinutes: 480,
    dailyTargetMinutes: 480,
    overtimeMultiplier: 1.4,
  }), 1_000_000);
});

test("partial days are prorated and overtime uses the configured multiplier", () => {
  assert.equal(calculateEmployeeDayPay({
    monthlySalary: 30_000_000,
    creditedMinutes: 240,
    dailyTargetMinutes: 480,
    overtimeMultiplier: 1.4,
  }), 500_000);

  assert.equal(Math.round(calculateEmployeeDayPay({
    monthlySalary: 30_000_000,
    creditedMinutes: 540,
    dailyTargetMinutes: 480,
    overtimeMultiplier: 1.4,
  })), 1_175_000);
});

import { calculateMonthlyPayroll } from "../lib/payroll.ts";

test("monthly payroll includes overtime, benefits and deductions", () => {
  const result = calculateMonthlyPayroll({
    monthlySalary: 30_000_000,
    workedMinutes: 10_200,
    targetMinutes: 10_000,
    overtimeMinutes: 200,
    deficitMinutes: 0,
    holidayMinutes: 0,
    overtimeMultiplier: 1.4,
    holidayMultiplier: 1.4,
    components: [
      { id: "housing", title: "حق مسکن", amount: 2_000_000, type: "earning" },
      { id: "insurance", title: "بیمه", amount: 1_000_000, type: "deduction" },
    ],
  });

  assert.equal(result.regularPay, 30_000_000);
  assert.equal(result.overtimePay, 840_000);
  assert.equal(result.earnings, 2_000_000);
  assert.equal(result.deductions, 1_000_000);
  assert.equal(result.net, 31_840_000);
});

test("monthly payroll deducts deficit and ignores disabled components", () => {
  const result = calculateMonthlyPayroll({
    monthlySalary: 30_000_000,
    workedMinutes: 9_900,
    targetMinutes: 10_000,
    overtimeMinutes: 0,
    deficitMinutes: 100,
    holidayMinutes: 0,
    overtimeMultiplier: 1.4,
    holidayMultiplier: 1.4,
    components: [
      { id: "bonus", title: "پاداش", amount: 9_000_000, type: "earning", enabled: false },
    ],
  });

  assert.equal(result.deficitDeduction, 300_000);
  assert.equal(result.earnings, 0);
});
