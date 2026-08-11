"use client";

import { WalletCards } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import type { TimeEntry } from "@/lib/types";
import { ChartsGrid } from "./chart-shell";
import { DonutSummary } from "./donut-summary";
import { FreelancerWeeklyChart } from "./freelancer-weekly-chart";
import { useFreelancerChartData } from "./use-freelancer-chart-data";

export function FreelancerCharts({ entries, reportBillable }: { entries: TimeEntry[]; reportBillable: number }) {
  const { t, duration } = useLocaleUi();
  const { weekly, billing, allMinutes, ratio, hasWeeklyData } = useFreelancerChartData(entries, reportBillable);
  return <ChartsGrid><FreelancerWeeklyChart data={weekly} hasData={hasWeeklyData} /><DonutSummary icon={<WalletCards />} title={t("reports.charts.billableSummary")} description={t("reports.charts.billableDescription")} data={billing} ratio={ratio} ratioLabel={t("common.billable")} footerLabel={t("reports.charts.projectTimeTotal")} footerValue={duration(allMinutes)} /></ChartsGrid>;
}
