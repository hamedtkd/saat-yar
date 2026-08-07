import type { PayrollCalculationPolicy, PayrollFacts, PayrollRateRule } from "./payroll-policy.ts";
import { normalizePayrollPolicy, roundPayrollAmount } from "./payroll-policy.ts";

function positive(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function activeComponents(facts: PayrollFacts) {
  return facts.components.filter((item) => item.enabled !== false);
}

function getBaseMinuteRate(policy: PayrollCalculationPolicy, facts: PayrollFacts) {
  if (policy.baseMode === "hourly") return policy.baseAmount / 60;
  if (policy.baseMode === "daily") return policy.baseAmount / policy.standardDayMinutes;
  return policy.baseAmount / Math.max(1, positive(facts.targetMinutes));
}

function calculateBasePay(policy: PayrollCalculationPolicy, facts: PayrollFacts) {
  const regularMinutes = Math.max(0, positive(facts.workedMinutes) - positive(facts.overtimeMinutes) - positive(facts.holidayMinutes));
  if (policy.baseMode === "monthly-fixed") return policy.baseAmount;
  if (policy.baseMode === "hourly") return regularMinutes * (policy.baseAmount / 60);
  if (policy.baseMode === "daily") return (regularMinutes / policy.standardDayMinutes) * policy.baseAmount;
  const ratio = Math.min(1, regularMinutes / Math.max(1, positive(facts.targetMinutes)));
  return policy.baseAmount * ratio;
}

function calculatePremium(minutes: number, rule: PayrollRateRule, baseMinuteRate: number) {
  const safeMinutes = positive(minutes);
  if (rule.mode === "ignore") return 0;
  if (rule.mode === "fixed-hourly") return safeMinutes * (positive(rule.hourlyRate) / 60);
  return safeMinutes * baseMinuteRate * positive(rule.multiplier);
}

export function calculatePayrollWithPolicy(rawPolicy: PayrollCalculationPolicy, rawFacts: PayrollFacts) {
  const policy = normalizePayrollPolicy(rawPolicy);
  const facts = {
    ...rawFacts,
    workedMinutes: positive(rawFacts.workedMinutes),
    targetMinutes: positive(rawFacts.targetMinutes),
    overtimeMinutes: positive(rawFacts.overtimeMinutes),
    deficitMinutes: positive(rawFacts.deficitMinutes),
    holidayMinutes: positive(rawFacts.holidayMinutes),
  };
  const round = (value: number) => roundPayrollAmount(value, policy.rounding);
  const baseMinuteRate = getBaseMinuteRate(policy, facts);
  const regularPay = round(calculateBasePay(policy, facts));
  const overtimePay = round(calculatePremium(facts.overtimeMinutes, policy.overtime, baseMinuteRate));
  const holidayPay = round(calculatePremium(facts.holidayMinutes, policy.holiday, baseMinuteRate));
  const deficitDeduction = policy.deficit.mode === "ignore"
    ? 0
    : round(facts.deficitMinutes * baseMinuteRate * positive(policy.deficit.multiplier));
  const recurring = activeComponents(facts);
  const earnings = round(recurring.filter((item) => item.type === "earning").reduce((sum, item) => sum + positive(item.amount), 0));
  const deductions = round(recurring.filter((item) => item.type === "deduction").reduce((sum, item) => sum + positive(item.amount), 0));
  const gross = regularPay + overtimePay + holidayPay + earnings;
  const totalDeductions = deficitDeduction + deductions;
  const net = Math.max(0, gross - totalDeductions);
  const breakdown = [
    { key: "base", title: "حقوق پایه", amount: regularPay, direction: "earning" },
    { key: "overtime", title: "اضافه‌کاری", amount: overtimePay, direction: "earning" },
    { key: "holiday", title: "تعطیل‌کاری", amount: holidayPay, direction: "earning" },
    { key: "earning", title: "مزایا", amount: earnings, direction: "earning" },
    { key: "deficit", title: "کسر کار", amount: deficitDeduction, direction: "deduction" },
    { key: "deduction", title: "کسورات", amount: deductions, direction: "deduction" },
  ] as const;

  return { regularPay, overtimePay, holidayPay, deficitDeduction, earnings, deductions, gross, totalDeductions, net, baseMinuteRate, breakdown };
}
