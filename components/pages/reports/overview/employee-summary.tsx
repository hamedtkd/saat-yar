"use client";

import { AlertTriangle, BriefcaseBusiness, CheckCircle2, Clock3, Pause, TrendingUp, WalletCards } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { PrivateMoney } from "@/components/common/private-money";
import { SurfaceCard } from "@/components/common/surface-card";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { cn } from "@/lib/cn";
import type { calculateMonthlyPayrollForSettings } from "@/lib/payroll";
import type { WorkRecord } from "@/lib/types";
import type { MonthStats } from "./types";

type Payroll = ReturnType<typeof calculateMonthlyPayrollForSettings>;
type EmployeeSummaryProps = { stats: MonthStats; records: WorkRecord[]; overtimeMinutes: number; deficitMinutes: number; payroll: Payroll; financialsHidden: boolean };

function PayrollValue({ value, hidden }: { value: number; hidden: boolean }) {
  const { t } = useLocaleUi();
  return <strong><PrivateMoney value={value} hidden={hidden} /> {t("common.currency.toman")}</strong>;
}

export function EmployeeSummary({ stats, records, overtimeMinutes, deficitMinutes, payroll, financialsHidden }: EmployeeSummaryProps) {
  const { t, duration, number } = useLocaleUi();
  return <>
    <section className={cn("mb-4 grid grid-cols-4 gap-3", "max-[1180px]:grid-cols-2", "max-[620px]:grid-cols-1")}>
      <MetricCard icon={<Clock3 />} label={t("reports.employee.monthWork")} value={duration(stats.worked)} suffix={t("common.hour")} tone="blue" />
      <MetricCard icon={<BriefcaseBusiness />} label={t("common.targetHours")} value={duration(stats.target)} suffix={t("common.hour")} />
      <MetricCard icon={<CheckCircle2 />} label={t("common.overtime")} value={duration(overtimeMinutes)} suffix={t("common.hour")} />
      <MetricCard icon={<AlertTriangle />} label={t("common.deficit")} value={duration(deficitMinutes)} suffix={t("common.hour")} tone="amber" />
    </section>
    <section className={cn("mb-4 grid grid-cols-3 gap-3", "max-[900px]:grid-cols-1")}>
      <MetricCard icon={<Pause />} label={t("reports.employee.rest")} value={duration(stats.breaks)} suffix={t("common.hour")} tone="amber" />
      <MetricCard icon={<TrendingUp />} label={t("reports.employee.balance")} value={duration(stats.balance, true)} suffix={t("common.hour")} />
      <MetricCard icon={<WalletCards />} label={t("reports.employee.recordedDays")} value={number(records.length)} suffix={t("common.day")} />
    </section>
    <SurfaceCard as="section" className="mb-4 overflow-hidden p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><strong className="block text-sm font-extrabold text-[var(--text)]">{t("reports.employee.payslip")}</strong><small className="text-[10px] leading-6 text-[var(--text-muted)]">{t("reports.employee.payslipHint")}</small></div><span className="rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-black text-[var(--accent-strong)]">{t("reports.employee.netLabel")} <PrivateMoney value={payroll.net} hidden={financialsHidden} /> {t("common.currency.toman")}</span></div>
      <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
        <PayrollStat label={t("common.regularPay")} value={payroll.regularPay} hidden={financialsHidden} />
        <PayrollStat label={t("common.overtime")} value={payroll.overtimePay} hidden={financialsHidden} />
        <PayrollStat label={t("common.holidayPay")} value={payroll.holidayPay} hidden={financialsHidden} />
        <PayrollStat label={t("common.deficit")} value={payroll.deficitDeduction} hidden={financialsHidden} tone="warning" />
        <PayrollStat label={t("common.benefits")} value={payroll.earnings} hidden={financialsHidden} tone="success" />
        <PayrollStat label={t("common.deductions")} value={payroll.deductions} hidden={financialsHidden} tone="danger" />
        <PayrollStat label={t("common.gross")} value={payroll.gross} hidden={financialsHidden} />
        <PayrollStat label={t("common.net")} value={payroll.net} hidden={financialsHidden} tone="dark" />
      </div>
      <div className="mt-4 grid gap-2 border-t border-[var(--border)] pt-4"><strong className="text-xs text-[var(--text)]">{t("common.breakdown")}</strong>{payroll.breakdown.filter((line) => line.amount > 0).map((line) => <div key={line.key} className="flex items-center justify-between gap-3 text-[10px] text-[var(--text-muted)]"><span>{line.direction === "deduction" ? "−" : "+"} {line.title}</span><strong className={line.direction === "deduction" ? "text-[var(--danger)]" : "text-[var(--text)]"}><PrivateMoney value={line.amount} hidden={financialsHidden} /> {t("common.currency.toman")}</strong></div>)}</div>
    </SurfaceCard>
  </>;
}

const statTone = { default: "bg-[var(--surface-2)] text-[var(--text)]", warning: "bg-[var(--warning-soft)] text-[var(--warning)]", success: "bg-[var(--success-soft)] text-[var(--success)]", danger: "bg-[var(--danger-soft)] text-[var(--danger)]", dark: "bg-[var(--accent-fill)] text-[var(--accent-foreground)]" } as const;
function PayrollStat({ label, value, hidden, tone = "default" }: { label: string; value: number; hidden: boolean; tone?: keyof typeof statTone }) { return <div className={cn("rounded-[15px] border border-[var(--dashboard-border)] p-3.5", statTone[tone])}><span className="block text-[10px] opacity-75">{label}</span><PayrollValue value={value} hidden={hidden} /></div>; }
