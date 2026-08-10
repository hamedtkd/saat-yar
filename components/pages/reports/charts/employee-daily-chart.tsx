"use client";

import { BarChart3, BriefcaseBusiness } from "lucide-react";
import { Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PanelHead } from "@/components/common/panel-head";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { ChartEmptyState } from "./chart-empty-state";
import { ChartLegend } from "./chart-legend";
import { CHART_COLORS } from "./chart-utils";
import { ChartShell } from "./chart-shell";
import { EmployeeDailyTooltip } from "./chart-tooltips";
import type { EmployeeChartItem } from "./types";

export function EmployeeDailyChart({ data }: { data: EmployeeChartItem[] }) {
  const { t, duration, direction } = useLocaleUi();
  return <ChartShell><div className="mb-1 flex flex-wrap items-start justify-between gap-3"><PanelHead icon={<BarChart3 />} title={t("reports.charts.employeeDailyTitle")} /><span className="rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-[10px] font-bold text-[var(--accent-strong)]">{t("common.currentMonth")}</span></div><p className="text-[10px] leading-6 text-[var(--text-muted)]">{t("reports.charts.employeeDailyDescription")}</p><ChartLegend className="mb-3 mt-3" items={[{ label: t("reports.charts.dailyNet"), color: CHART_COLORS.worked }, { label: t("reports.charts.dailyTarget"), color: CHART_COLORS.target }]} />{data.length ? <div className="overflow-x-auto pb-1 [scrollbar-width:thin]"><div className="h-[310px] min-w-[620px] sm:min-w-0" role="img" aria-label={t("reports.charts.employeeDailyAria")}><ResponsiveContainer width="100%" height="100%"><ComposedChart data={data} margin={{ top: 10, right: 2, bottom: 2, left: 2 }} barGap={4}><CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 6" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "inherit" }} tickMargin={12} minTickGap={6} /><YAxis orientation={direction === "rtl" ? "right" : "left"} axisLine={false} tickLine={false} width={50} tick={{ fill: "var(--text-muted)", fontSize: 9, fontFamily: "inherit" }} tickFormatter={(value: number) => duration(value)} /><Tooltip cursor={{ fill: "var(--accent-soft)", radius: 8 }} content={<EmployeeDailyTooltip />} /><Bar dataKey="target" name={t("reports.charts.dailyTarget")} fill={CHART_COLORS.target} fillOpacity={0.22} radius={[6, 6, 2, 2]} maxBarSize={30} /><Bar dataKey="worked" name={t("reports.charts.dailyNet")} fill={CHART_COLORS.worked} radius={[6, 6, 2, 2]} maxBarSize={24} /></ComposedChart></ResponsiveContainer></div></div> : <ChartEmptyState icon={<BriefcaseBusiness className="size-5" />} title={t("reports.table.employeeEmpty")} description={t("reports.charts.employeeDailyEmptyHint")} />}</ChartShell>;
}
