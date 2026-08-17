import { calculatePayrollWithPolicy } from "./payroll-engine.ts";
import { createLegacyPayrollPolicy, normalizePayrollPolicy, type PayrollCalculationPolicy, type PayrollFacts } from "./payroll-policy.ts";
import type { PayrollComponent, Settings } from "./types.ts";

export const STANDARD_MONTH_DAYS = 30;

export function dailyBaseSalary(monthlySalary: number) {
  return Math.max(0, monthlySalary) / STANDARD_MONTH_DAYS;
}

export function calculateEmployeeDayPay({
  monthlySalary,
  creditedMinutes,
  dailyTargetMinutes,
  overtimeMultiplier = 1,
  holidayMultiplier = 1,
  holiday = false,
}: {
  monthlySalary: number;
  creditedMinutes: number;
  dailyTargetMinutes: number;
  overtimeMultiplier?: number;
  holidayMultiplier?: number;
  holiday?: boolean;
}) {
  const target = Math.max(1, dailyTargetMinutes);
  const credited = Math.max(0, creditedMinutes);
  const overtimeMinutes = holiday ? 0 : Math.max(0, credited - target);
  const holidayMinutes = holiday ? credited : 0;
  const policy = createLegacyPayrollPolicy({
    monthlySalary: dailyBaseSalary(monthlySalary),
    overtimeMultiplier,
    holidayMultiplier,
  });
  const result = calculatePayrollWithPolicy(policy, {
    workedMinutes: credited,
    targetMinutes: target,
    overtimeMinutes,
    deficitMinutes: 0,
    holidayMinutes,
    components: [],
  });
  return result.net;
}

export type MonthlyPayrollInput = {
  monthlySalary: number;
  workedMinutes: number;
  targetMinutes: number;
  overtimeMinutes: number;
  deficitMinutes: number;
  holidayMinutes: number;
  overtimeMultiplier: number;
  holidayMultiplier: number;
  components: PayrollComponent[];
};

export function calculateMonthlyPayroll(input: MonthlyPayrollInput) {
  return calculatePayrollWithPolicy(createLegacyPayrollPolicy({
    monthlySalary: input.monthlySalary,
    overtimeMultiplier: input.overtimeMultiplier,
    holidayMultiplier: input.holidayMultiplier,
  }), {
    workedMinutes: input.workedMinutes,
    targetMinutes: input.targetMinutes,
    overtimeMinutes: input.overtimeMinutes,
    deficitMinutes: input.deficitMinutes,
    holidayMinutes: input.holidayMinutes,
    components: input.components,
  });
}


export function getPayrollPolicy(settings: Settings): PayrollCalculationPolicy {
  const fallback = createLegacyPayrollPolicy({
    monthlySalary: settings.salary,
    overtimeMultiplier: settings.overtimeMultiplier,
    holidayMultiplier: settings.holidayMultiplier,
  });
  fallback.rateBasis = "standard-month";
  return normalizePayrollPolicy(settings.payrollPolicy ?? fallback);
}

export function calculateMonthlyPayrollForSettings(settings: Settings, facts: Omit<PayrollFacts, "components">) {
  return calculatePayrollWithPolicy(getPayrollPolicy(settings), { ...facts, components: settings.payrollComponents });
}

export function calculateEmployeeDayPayForSettings({
  settings, creditedMinutes, dailyTargetMinutes, holiday = false,
}: {
  settings: Settings;
  creditedMinutes: number;
  dailyTargetMinutes: number;
  holiday?: boolean;
}) {
  const policy = getPayrollPolicy(settings);
  const dayPolicy: PayrollCalculationPolicy = {
    ...policy,
    baseAmount: policy.baseMode.startsWith("monthly-") ? policy.baseAmount / STANDARD_MONTH_DAYS : policy.baseAmount,
    overtime: { ...policy.overtime },
    holiday: { ...policy.holiday },
    deficit: { ...policy.deficit },
    rounding: { ...policy.rounding },
  };
  const target = Math.max(1, dailyTargetMinutes);
  const credited = Math.max(0, creditedMinutes);
  const holidayMinutes = holiday ? credited : 0;
  const overtimeMinutes = holiday ? 0 : Math.max(0, credited - target);
  const rateContext = policy.baseMode.startsWith("monthly-") && policy.rateBasis === "standard-month"
    ? { baseAmount: policy.baseAmount }
    : undefined;
  return calculatePayrollWithPolicy(dayPolicy, {
    workedMinutes: credited,
    targetMinutes: target,
    overtimeMinutes,
    deficitMinutes: 0,
    holidayMinutes,
    components: [],
  }, rateContext).net;
}
