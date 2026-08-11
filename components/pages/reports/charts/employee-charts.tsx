"use client";

import { BriefcaseBusiness } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import type { Settings, WorkRecord } from "@/lib/types";
import { ChartsGrid } from "./chart-shell";
import { DonutSummary } from "./donut-summary";
import { EmployeeDailyChart } from "./employee-daily-chart";
import type { MonthStats } from "./types";
import { useEmployeeChartData } from "./use-employee-chart-data";

export function EmployeeCharts({ monthRecords, monthStats, settings }: { monthRecords: WorkRecord[]; monthStats: MonthStats; settings: Settings }) {
  const { t, duration } = useLocaleUi();
  const { daily, performance, ratio } = useEmployeeChartData(monthRecords, monthStats, settings);
  return <ChartsGrid><EmployeeDailyChart data={daily} /><DonutSummary icon={<BriefcaseBusiness />} title={t("reports.charts.employeeMonthTitle")} description={t("reports.charts.employeeMonthDescription")} data={performance} ratio={ratio} ratioLabel={t("reports.charts.employeeMonthRatio")} footerLabel={t("reports.charts.employeeMonthFooter")} footerValue={duration(monthStats.balance, true)} footerTone={monthStats.balance >= 0 ? "positive" : "negative"} /></ChartsGrid>;
}
