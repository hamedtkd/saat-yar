"use client";

import type { ReactNode } from "react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { cn } from "@/lib/cn";
import { calculateEmployeeDayPayForSettings } from "@/lib/payroll";
import { calc } from "@/lib/time-engine";
import { getDailyTargetMinutes } from "@/lib/work-schedule";
import type { Settings, WorkRecord } from "@/lib/types";

export type EmployeeTotals = { worked: number; leave: number; balance: number; rest: number; income: number };

export function InfoRow({ label, value, valueClassName, className }: { label: string; value: ReactNode; valueClassName?: string; className?: string }) {
  const { direction } = useLocaleUi();
  return <div className={cn("flex min-w-0 items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 py-3", className)}><span className="shrink-0 text-[10px] font-medium text-[var(--text-muted)]">{label}</span><strong className={cn("min-w-0 text-xs font-extrabold text-[var(--text)]", direction === "rtl" ? "text-left" : "text-right", valueClassName)}>{value}</strong></div>;
}

export function TableHeading({ children }: { children: ReactNode }) {
  const { direction } = useLocaleUi();
  return <th className={cn("h-11 whitespace-nowrap border-y border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 font-semibold text-[var(--text-muted)]", direction === "rtl" ? "text-right" : "text-left")}>{children}</th>;
}

export function getEmployeeDayPay({ record, settings, dailyTarget = getDailyTargetMinutes(record.date, settings) }: { record: WorkRecord; settings: Settings; dailyTarget?: number }) { const result = calc(record, dailyTarget); return calculateEmployeeDayPayForSettings({ settings, creditedMinutes: result.credited, dailyTargetMinutes: dailyTarget, holiday: record.holiday }); }
export function getEmployeeTotals(records: WorkRecord[], settings: Settings): EmployeeTotals { return records.reduce<EmployeeTotals>((totals, record) => { const dailyTarget = getDailyTargetMinutes(record.date, settings); const result = calc(record, dailyTarget); totals.worked += result.worked; totals.leave += result.leave; totals.balance += result.balance; totals.rest += result.breakMinutes + record.lunchMinutes; totals.income += getEmployeeDayPay({ record, settings, dailyTarget }); return totals; }, { worked: 0, leave: 0, balance: 0, rest: 0, income: 0 }); }
