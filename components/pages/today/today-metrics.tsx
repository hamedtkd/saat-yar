import { Clock3, Tag, WalletCards } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { PrivateMoney } from "@/components/common/private-money";
import { ProgressRing } from "@/components/common/progress-ring";
import { SurfaceCard } from "@/components/common/surface-card";
import { duration, entryMinutes, fa, localDateKey } from "@/lib/format";
import { calculateEmployeeDayPay } from "@/lib/payroll";
import type { ReturnTypeCalc } from "@/lib/type-helpers";
import type { AppData, WorkRecord } from "@/lib/types";

export function TodayMetrics({ data, record, selectedDate, result, dailyTarget, financialsHidden }: {
  data: AppData;
  record: WorkRecord;
  selectedDate: string;
  result: ReturnTypeCalc;
  dailyTarget: number;
  financialsHidden: boolean;
}) {
  const progress = dailyTarget === 0 ? 100 : Math.min(100, Math.round(result.credited / dailyTarget * 100));
  const todayEntries = data.timeEntries.filter((entry) => localDateKey(new Date(entry.startedAt)) === selectedDate);
  const projectMinutes = todayEntries.reduce((sum, entry) => sum + entryMinutes(entry), 0);
  const billableMinutes = todayEntries.reduce((sum, entry) => sum + (entry.billable ? entryMinutes(entry) : 0), 0);
  const projectIncome = todayEntries.reduce((sum, entry) => sum + (entry.billable ? entryMinutes(entry) / 60 * entry.effectiveRate : 0), 0);
  const employeeIncome = calculateEmployeeDayPay({ monthlySalary: data.settings.salary, creditedMinutes: result.credited, dailyTargetMinutes: dailyTarget, overtimeMultiplier: data.settings.overtimeMultiplier, holidayMultiplier: data.settings.holidayMultiplier, holiday: record.holiday });
  const isEmployee = data.settings.mode === "employee";
  const isHybrid = data.settings.mode === "hybrid";
  const income = isEmployee ? employeeIncome : isHybrid ? employeeIncome + projectIncome : projectIncome;

  return (
    <section className="mb-5 grid grid-cols-4 gap-4 max-[1180px]:grid-cols-2 max-[620px]:grid-cols-1">
      <MetricCard icon={<Clock3 />} label="کارکرد خالص امروز" value={duration(result.worked)} suffix="ساعت" />
      <MetricCard icon={<Tag />} label={isEmployee ? "زمان قابل محاسبه" : "قابل صورتحساب"} value={duration(isEmployee ? result.credited : billableMinutes)} suffix="ساعت" />
      <MetricCard icon={<WalletCards />} label={isEmployee ? "حقوق امروز" : isHybrid ? "درآمد ترکیبی امروز" : "درآمد پروژه امروز"} value={<PrivateMoney value={income} hidden={financialsHidden} />} suffix="تومان" tone="blue" />
      <SurfaceCard as="article" className="flex min-h-32 items-center justify-center gap-4 p-5">
        <ProgressRing value={progress}><strong className="text-lg font-black">{fa.format(progress)}٪</strong></ProgressRing>
        <div><small className="block text-xs text-[var(--text-muted)]">هدف روزانه</small><strong className="mt-1 block text-lg font-black">{duration(result.credited)}</strong><span className="text-[11px] text-[var(--text-muted)]">از {duration(dailyTarget)}{!isEmployee ? ` · پروژه ${duration(projectMinutes)}` : ""}</span></div>
      </SurfaceCard>
    </section>
  );
}
