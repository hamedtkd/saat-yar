import {
  AlertTriangle,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Pause,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { MetricCard } from "@/components/common/metric-card";
import { PrivateMoney } from "@/components/common/private-money";
import { SurfaceCard } from "@/components/common/surface-card";
import { cn } from "@/lib/cn";
import { duration, fa } from "@/lib/format";
import type { calculateMonthlyPayrollForSettings } from "@/lib/payroll";
import type { WorkRecord } from "@/lib/types";

import type { MonthStats } from "./types";

type Payroll = ReturnType<typeof calculateMonthlyPayrollForSettings>;

type EmployeeSummaryProps = {
  stats: MonthStats;
  records: WorkRecord[];
  overtimeMinutes: number;
  deficitMinutes: number;
  payroll: Payroll;
  financialsHidden: boolean;
};

function PayrollValue({
  value,
  hidden,
}: {
  value: number;
  hidden: boolean;
}) {
  return (
    <strong>
      <PrivateMoney value={value} hidden={hidden} /> تومان
    </strong>
  );
}

export function EmployeeSummary({
  stats,
  records,
  overtimeMinutes,
  deficitMinutes,
  payroll,
  financialsHidden,
}: EmployeeSummaryProps) {
  return (
    <>
      <section className={cn("mb-4 grid grid-cols-4 gap-3", "max-[1180px]:grid-cols-2", "max-[620px]:grid-cols-1")}>
        <MetricCard icon={<Clock3 />} label="کارکرد این ماه" value={duration(stats.worked)} suffix="ساعت" tone="blue" />
        <MetricCard icon={<BriefcaseBusiness />} label="ساعت موظفی" value={duration(stats.target)} suffix="ساعت" />
        <MetricCard icon={<CheckCircle2 />} label="اضافه‌کاری" value={duration(overtimeMinutes)} suffix="ساعت" />
        <MetricCard icon={<AlertTriangle />} label="کسری کار" value={duration(deficitMinutes)} suffix="ساعت" tone="amber" />
      </section>

      <section className={cn("mb-4 grid grid-cols-3 gap-3", "max-[900px]:grid-cols-1")}>
        <MetricCard icon={<Pause />} label="وقفه و استراحت" value={duration(stats.breaks)} suffix="ساعت" tone="amber" />
        <MetricCard icon={<TrendingUp />} label="تراز کارکرد" value={duration(stats.balance, true)} suffix="ساعت" />
        <MetricCard icon={<WalletCards />} label="روزهای ثبت‌شده" value={fa.format(records.length)} suffix="روز" />
      </section>

      <SurfaceCard as="section" className="mb-4 overflow-hidden p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <strong className="block text-sm font-extrabold text-[var(--text)]">فیش حقوقی تخمینی ماه</strong>
            <small className="text-[10px] leading-6 text-[var(--text-muted)]">مبالغ با Policy حقوق ذخیره‌شده، کارکرد این ماه و آیتم‌های مزایا/کسورات محاسبه می‌شوند.</small>
          </div>
          <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-black text-[var(--accent-strong)]">
            خالص: <PrivateMoney value={payroll.net} hidden={financialsHidden} /> تومان
          </span>
        </div>
        <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
          <PayrollStat label="حقوق کارکرد" value={payroll.regularPay} hidden={financialsHidden} />
          <PayrollStat label="اضافه‌کاری" value={payroll.overtimePay} hidden={financialsHidden} />
          <PayrollStat label="تعطیل‌کاری" value={payroll.holidayPay} hidden={financialsHidden} />
          <PayrollStat label="کسری کار" value={payroll.deficitDeduction} hidden={financialsHidden} tone="warning" />
          <PayrollStat label="مزایا" value={payroll.earnings} hidden={financialsHidden} tone="success" />
          <PayrollStat label="کسورات ثابت" value={payroll.deductions} hidden={financialsHidden} tone="danger" />
          <PayrollStat label="ناخالص" value={payroll.gross} hidden={financialsHidden} />
          <PayrollStat label="خالص پرداختی" value={payroll.net} hidden={financialsHidden} tone="dark" />
        </div>
        <div className="mt-4 grid gap-2 border-t border-[var(--border)] pt-4">
          <strong className="text-xs text-[var(--text)]">ریز محاسبه</strong>
          {payroll.breakdown.filter((line) => line.amount > 0).map((line) => (
            <div key={line.key} className="flex items-center justify-between gap-3 text-[10px] text-[var(--text-muted)]">
              <span>{line.direction === "deduction" ? "−" : "+"} {line.title}</span>
              <strong className={line.direction === "deduction" ? "text-[var(--danger)]" : "text-[var(--text)]"}><PrivateMoney value={line.amount} hidden={financialsHidden} /> تومان</strong>
            </div>
          ))}
        </div>
      </SurfaceCard>
    </>
  );
}

const statTone = {
  default: "bg-[var(--surface-2)] text-[var(--text)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  success: "bg-[var(--success-soft)] text-[var(--success)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  dark: "bg-[var(--accent-fill)] text-[var(--accent-foreground)]",
} as const;

function PayrollStat({
  label,
  value,
  hidden,
  tone = "default",
}: {
  label: string;
  value: number;
  hidden: boolean;
  tone?: keyof typeof statTone;
}) {
  return (
    <div className={cn("rounded-[15px] border border-[var(--dashboard-border)] p-3.5", statTone[tone])}>
      <span className="block text-[10px] opacity-75">{label}</span>
      <PayrollValue value={value} hidden={hidden} />
    </div>
  );
}
