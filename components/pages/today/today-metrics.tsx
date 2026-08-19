"use client";

import { Clock3, Tag, WalletCards } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { PrivateMoney } from "@/components/common/private-money";
import { ProgressRing } from "@/components/common/progress-ring";
import { SurfaceCard } from "@/components/common/surface-card";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { useLiveWorkCalc } from "@/hooks/use-live-work-calc";
import { useRuntimeNow } from "@/hooks/use-runtime-now";
import { entryMinutes, localDateKey } from "@/lib/format";
import { calculateEmployeeDayPayForSettings } from "@/lib/payroll";
import type { ReturnTypeCalc } from "@/lib/type-helpers";
import type { AppData, WorkRecord } from "@/lib/types";

export function TodayMetrics({ data, record, selectedDate, result, dailyTarget, financialsHidden, scheduledDayOff }: {
  data: AppData;
  record: WorkRecord;
  selectedDate: string;
  result: ReturnTypeCalc;
  dailyTarget: number;
  financialsHidden: boolean;
  scheduledDayOff: boolean;
}) {
  const { duration, percent, t } = useLocaleUi();
  const hasTarget = dailyTarget > 0;
  const liveResult = useLiveWorkCalc(record, dailyTarget, result);
  const todayEntries = data.timeEntries.filter((entry) => localDateKey(new Date(entry.startedAt)) === selectedDate);
  const runtimeActive = Boolean(record.start && !record.end) || todayEntries.some((entry) => !entry.endedAt);
  const now = useRuntimeNow("minute", runtimeActive);
  const readMinutes = (entry: (typeof todayEntries)[number]) => entryMinutes(entry, now ?? 0);
  const progress = hasTarget ? Math.min(100, Math.round(liveResult.credited / dailyTarget * 100)) : 0;
  const projectMinutes = todayEntries.reduce((sum, entry) => sum + readMinutes(entry), 0);
  const billableMinutes = todayEntries.reduce((sum, entry) => sum + (entry.billable ? readMinutes(entry) : 0), 0);
  const projectIncome = todayEntries.reduce((sum, entry) => sum + (entry.billable ? readMinutes(entry) / 60 * entry.effectiveRate : 0), 0);
  const employeeIncome = calculateEmployeeDayPayForSettings({ settings: data.settings, creditedMinutes: liveResult.credited, dailyTargetMinutes: dailyTarget, holiday: record.holiday });
  const isEmployee = data.settings.mode === "employee";
  const isHybrid = data.settings.mode === "hybrid";
  const income = isEmployee ? employeeIncome : isHybrid ? employeeIncome + projectIncome : projectIncome;

  return (
    <section className="mb-4 grid grid-cols-4 gap-2.5 max-[1180px]:grid-cols-2 max-[620px]:grid-cols-1 max-[359px]:gap-2 [&>article]:min-h-[104px] max-[359px]:[&>article]:min-h-[88px] max-[359px]:[&>article]:p-3 [&>article]:shadow-[0_5px_16px_rgba(0,0,0,.03)]">
      <MetricCard icon={<Clock3 />} label={t("today.metrics.netWorked")} value={duration(liveResult.worked)} suffix={t("common.hour")} />
      <MetricCard icon={<Tag />} label={isEmployee ? t("today.metrics.calculable") : t("common.billable")} value={duration(isEmployee ? liveResult.credited : billableMinutes)} suffix={t("common.hour")} tone="amber" />
      <MetricCard icon={<WalletCards />} label={isEmployee ? t("today.metrics.salaryToday") : isHybrid ? t("today.metrics.hybridIncome") : t("today.metrics.projectIncome")} value={<PrivateMoney value={income} hidden={financialsHidden} />} suffix={t("common.currency.toman")} tone="green" />
      <SurfaceCard as="article" className="dashboard-card flex min-h-[104px] items-center justify-center gap-4 p-4 max-[359px]:min-h-[88px] max-[359px]:gap-3 max-[359px]:p-3">
        <ProgressRing value={progress} size="sm"><strong className="text-sm font-black">{hasTarget ? percent(progress) : "—"}</strong></ProgressRing>
        <div>
          <small className="block text-[10px] text-[var(--text-muted)]">{scheduledDayOff ? t("today.summary.scheduledOff") : hasTarget ? t("today.metrics.dailyTarget") : t("today.metrics.noTarget")}</small>
          <strong className="mt-1 block text-lg font-black">{duration(liveResult.credited)}</strong>
          <span className="text-[10px] text-[var(--text-muted)]">
            {scheduledDayOff ? t("today.metrics.zeroRequired") : hasTarget ? t("today.metrics.ofTarget", { duration: duration(dailyTarget) }) : t("today.metrics.noRequired")}
            {!isEmployee ? ` ${t("today.metrics.projectTime", { duration: duration(projectMinutes) })}` : ""}
          </span>
        </div>
      </SurfaceCard>
    </section>
  );
}
