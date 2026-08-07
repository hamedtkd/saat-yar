import { Clock3, Tag, WalletCards } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { PrivateMoney } from "@/components/common/private-money";
import { ProgressRing } from "@/components/common/progress-ring";
import { SurfaceCard } from "@/components/common/surface-card";
import { duration, entryMinutes, fa, localDateKey } from "@/lib/format";
import { calculateEmployeeDayPayForSettings } from "@/lib/payroll";
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
  const hasTarget = dailyTarget > 0;
  const progress = hasTarget ? Math.min(100, Math.round(result.credited / dailyTarget * 100)) : 0;
  const todayEntries = data.timeEntries.filter((entry) => localDateKey(new Date(entry.startedAt)) === selectedDate);
  const projectMinutes = todayEntries.reduce((sum, entry) => sum + entryMinutes(entry), 0);
  const billableMinutes = todayEntries.reduce((sum, entry) => sum + (entry.billable ? entryMinutes(entry) : 0), 0);
  const projectIncome = todayEntries.reduce((sum, entry) => sum + (entry.billable ? entryMinutes(entry) / 60 * entry.effectiveRate : 0), 0);
  const employeeIncome = calculateEmployeeDayPayForSettings({ settings: data.settings, creditedMinutes: result.credited, dailyTargetMinutes: dailyTarget, holiday: record.holiday });
  const isEmployee = data.settings.mode === "employee";
  const isHybrid = data.settings.mode === "hybrid";
  const income = isEmployee ? employeeIncome : isHybrid ? employeeIncome + projectIncome : projectIncome;

  return (
    <section className="mb-4 grid grid-cols-4 gap-2.5 max-[1180px]:grid-cols-2 max-[620px]:grid-cols-1 [&>article]:min-h-[104px] [&>article]:shadow-[0_5px_16px_rgba(0,0,0,.03)]">
      <MetricCard icon={<Clock3 />} label="کارکرد خالص امروز" value={duration(result.worked)} suffix="ساعت" />
      <MetricCard icon={<Tag />} label={isEmployee ? "زمان قابل محاسبه" : "قابل صورتحساب"} value={duration(isEmployee ? result.credited : billableMinutes)} suffix="ساعت" tone="amber" />
      <MetricCard icon={<WalletCards />} label={isEmployee ? "حقوق امروز" : isHybrid ? "درآمد ترکیبی امروز" : "درآمد پروژه امروز"} value={<PrivateMoney value={income} hidden={financialsHidden} />} suffix="تومان" tone="green" />
      <SurfaceCard as="article" className="dashboard-card flex min-h-[104px] items-center justify-center gap-4 p-4">
        <ProgressRing value={progress} size="sm"><strong className="text-sm font-black">{hasTarget ? `${fa.format(progress)}٪` : "—"}</strong></ProgressRing>
        <div><small className="block text-[10px] text-[var(--text-muted)]">{hasTarget ? "هدف روزانه" : "روز بدون هدف"}</small><strong className="mt-1 block text-lg font-black">{duration(result.credited)}</strong><span className="text-[10px] text-[var(--text-muted)]">{hasTarget ? `از ${duration(dailyTarget)}` : "بدون ساعت موظفی"}{!isEmployee ? ` · پروژه ${duration(projectMinutes)}` : ""}</span></div>
      </SurfaceCard>
    </section>
  );
}
