"use client";

import { SummaryRow } from "@/components/common/summary-row";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import type { WeeklyChartItem } from "./types";

type WeeklySummaryProps = { totalMinutes: number; averageMinutes: number; bestDay: WeeklyChartItem | null };

export function WeeklySummary({ totalMinutes, averageMinutes, bestDay }: WeeklySummaryProps) {
  const { t, duration } = useLocaleUi();
  return <div className="mt-3 grid gap-2">
    <SummaryRow label={t("month.weekly.total")} value={duration(totalMinutes)} valueClassName="tabular-nums" />
    <SummaryRow label={t("month.weekly.average")} value={duration(averageMinutes)} valueClassName="tabular-nums" />
    <SummaryRow label={t("month.weekly.max")} hint={bestDay?.dayFull} value={bestDay ? duration(bestDay.minutes) : "—"} valueClassName="tabular-nums" />
  </div>;
}
