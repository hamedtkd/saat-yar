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
