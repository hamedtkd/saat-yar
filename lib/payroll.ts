import type { PayrollComponent } from "./types.ts";

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
  const minuteRate = dailyBaseSalary(monthlySalary) / target;

  if (holiday) return Math.round(credited * minuteRate * Math.max(0, holidayMultiplier));

  const regularMinutes = Math.min(credited, target);
  const overtimeMinutes = Math.max(0, credited - target);
  return Math.round(regularMinutes * minuteRate + overtimeMinutes * minuteRate * Math.max(0, overtimeMultiplier));
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
  const target = Math.max(1, input.targetMinutes);
  const baseMinuteRate = Math.max(0, input.monthlySalary) / target;
  const regularRatio = Math.min(1, Math.max(0, input.workedMinutes - input.overtimeMinutes - input.holidayMinutes) / target);
  const regularPay = Math.round(Math.max(0, input.monthlySalary) * regularRatio);
  const overtimePay = Math.round(Math.max(0, input.overtimeMinutes) * baseMinuteRate * Math.max(0, input.overtimeMultiplier));
  const holidayPay = Math.round(Math.max(0, input.holidayMinutes) * baseMinuteRate * Math.max(0, input.holidayMultiplier));
  const deficitDeduction = Math.round(Math.max(0, input.deficitMinutes) * baseMinuteRate);
  const recurring = input.components.filter((item) => item.enabled !== false);
  const earnings = recurring.filter((item) => item.type === "earning").reduce((sum, item) => sum + Math.max(0, item.amount), 0);
  const deductions = recurring.filter((item) => item.type === "deduction").reduce((sum, item) => sum + Math.max(0, item.amount), 0);
  const gross = regularPay + overtimePay + holidayPay + earnings;
  const totalDeductions = deductions + deficitDeduction;

  return {
    regularPay,
    overtimePay,
    holidayPay,
    deficitDeduction,
    earnings,
    deductions,
    gross,
    totalDeductions,
    net: Math.max(0, gross - totalDeductions),
  };
}
