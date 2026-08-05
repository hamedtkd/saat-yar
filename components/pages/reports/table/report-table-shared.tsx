import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { calculateEmployeeDayPay } from "@/lib/payroll";
import { calc, timeToMinutes } from "@/lib/time-engine";
import type { Settings, WorkRecord } from "@/lib/types";

export type EmployeeTotals = {
  worked: number;
  leave: number;
  balance: number;
  rest: number;
  income: number;
};

export const EMPLOYEE_HEADINGS = [
  "تاریخ", "ورود", "خروج", "ناهار", "وقفه‌ها", "کارکرد خالص", "مرخصی", "تراز", "حقوق روز", "توضیح",
];

export const FREELANCER_HEADINGS = [
  "تاریخ", "مشتری", "پروژه", "شرح", "مدت", "نرخ مؤثر", "مبلغ", "وضعیت",
];

export function InfoRow({ label, value, valueClassName, className }: {
  label: string;
  value: ReactNode;
  valueClassName?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 items-center justify-between gap-4", "rounded-xl border border-[var(--border)]", "bg-[var(--surface-1)] px-3 py-3", className)}>
      <span className="shrink-0 text-[10px] font-medium text-[var(--text-muted)]">{label}</span>
      <strong className={cn("min-w-0 text-left text-xs font-extrabold text-[var(--text)]", valueClassName)}>{value}</strong>
    </div>
  );
}

export function TableHeading({ children }: { children: ReactNode }) {
  return (
    <th className={cn("h-11 whitespace-nowrap", "border-y border-[var(--border)]", "bg-[var(--surface-2)] px-3 py-2", "text-right font-semibold text-[var(--text-muted)]")}>{children}</th>
  );
}

export function getDailyTarget(settings: Settings) {
  return Math.max(1, timeToMinutes(settings.defaultEnd) - timeToMinutes(settings.defaultStart) - settings.lunchMinutes);
}

export function getEmployeeDayPay({ record, settings, dailyTarget }: { record: WorkRecord; settings: Settings; dailyTarget: number }) {
  const result = calc(record, dailyTarget);
  return calculateEmployeeDayPay({
    monthlySalary: settings.salary,
    creditedMinutes: result.credited,
    dailyTargetMinutes: dailyTarget,
    overtimeMultiplier: settings.overtimeMultiplier,
    holidayMultiplier: settings.holidayMultiplier,
    holiday: record.holiday,
  });
}

export function getEmployeeTotals(records: WorkRecord[], settings: Settings, dailyTarget: number): EmployeeTotals {
  return records.reduce<EmployeeTotals>((totals, record) => {
    const result = calc(record, dailyTarget);
    totals.worked += result.worked;
    totals.leave += result.leave;
    totals.balance += result.balance;
    totals.rest += result.breakMinutes + record.lunchMinutes;
    totals.income += getEmployeeDayPay({ record, settings, dailyTarget });
    return totals;
  }, { worked: 0, leave: 0, balance: 0, rest: 0, income: 0 });
}
