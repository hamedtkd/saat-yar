"use client";

import { CheckCircle2, Clock3, Pause, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { PrivateMoney } from "@/components/common/private-money";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { cn } from "@/lib/cn";
import type { MonthStats } from "./types";

type FreelancerSummaryProps = { stats: MonthStats; totalProjectTime: number; reportBillable: number; nonBillableMinutes: number; reportIncome: number; financialsHidden: boolean };
export function FreelancerSummary({ stats, totalProjectTime, reportBillable, nonBillableMinutes, reportIncome, financialsHidden }: FreelancerSummaryProps) {
  const { t, duration } = useLocaleUi();
  return <section className={cn("mb-4 grid grid-cols-4 gap-3", "max-[1180px]:grid-cols-2", "max-[620px]:grid-cols-1")}>
    <MetricCard icon={<Clock3 />} label={t("reports.freelancer.totalTime")} value={duration(stats.worked + totalProjectTime)} suffix={t("common.hour")} tone="blue" />
    <MetricCard icon={<CheckCircle2 />} label={t("common.billable")} value={duration(reportBillable)} suffix={t("common.hour")} />
    <MetricCard icon={<Pause />} label={t("common.nonBillable")} value={duration(nonBillableMinutes)} suffix={t("common.hour")} tone="amber" />
    <MetricCard icon={<TrendingUp />} label={t("reports.freelancer.estimatedIncome")} value={<PrivateMoney value={reportIncome} hidden={financialsHidden} />} suffix={t("common.currency.toman")} />
  </section>;
}
