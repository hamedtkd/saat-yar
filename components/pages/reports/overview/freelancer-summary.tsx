import { CheckCircle2, Clock3, Pause, TrendingUp } from "lucide-react";

import { MetricCard } from "@/components/common/metric-card";
import { PrivateMoney } from "@/components/common/private-money";
import { cn } from "@/lib/cn";
import { duration } from "@/lib/format";

import type { MonthStats } from "./types";

type FreelancerSummaryProps = {
  stats: MonthStats;
  totalProjectTime: number;
  reportBillable: number;
  nonBillableMinutes: number;
  reportIncome: number;
  financialsHidden: boolean;
};

export function FreelancerSummary({
  stats,
  totalProjectTime,
  reportBillable,
  nonBillableMinutes,
  reportIncome,
  financialsHidden,
}: FreelancerSummaryProps) {
  return (
    <section className={cn("mb-4 grid grid-cols-4 gap-3", "max-[1180px]:grid-cols-2", "max-[620px]:grid-cols-1")}>
      <MetricCard icon={<Clock3 />} label="کل زمان" value={duration(stats.worked + totalProjectTime)} suffix="ساعت" tone="blue" />
      <MetricCard icon={<CheckCircle2 />} label="قابل صورتحساب" value={duration(reportBillable)} suffix="ساعت" />
      <MetricCard icon={<Pause />} label="غیرقابل صورتحساب" value={duration(nonBillableMinutes)} suffix="ساعت" tone="amber" />
      <MetricCard
        icon={<TrendingUp />}
        label="درآمد تخمینی"
        value={<PrivateMoney value={reportIncome} hidden={financialsHidden} />}
        suffix="تومان"
      />
    </section>
  );
}
