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
