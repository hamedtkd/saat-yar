"use client";

import { BarChart3 } from "lucide-react";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PanelHead } from "@/components/common/panel-head";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { ChartEmptyState } from "./chart-empty-state";
import { ChartLegend } from "./chart-legend";
import { CHART_COLORS } from "./chart-utils";
import { ChartShell } from "./chart-shell";
import { FreelancerWeeklyTooltip } from "./chart-tooltips";
import type { FreelancerChartItem } from "./types";

export function FreelancerWeeklyChart({ data, hasData }: { data: FreelancerChartItem[]; hasData: boolean }) {
  const { t, duration, number, direction } = useLocaleUi();
  const compactIncome = (value: number) => {
    const absolute = Math.abs(value);
    if (absolute >= 1_000_000_000) return t("reports.charts.billion", { value: number(Math.round(value / 1_000_000_000)) });
    if (absolute >= 1_000_000) return t("reports.charts.million", { value: number(Math.round(value / 1_000_000)) });
    if (absolute >= 1_000) return t("reports.charts.thousand", { value: number(Math.round(value / 1_000)) });
    return number(Math.round(value));
  };
  return <ChartShell><div className="mb-1 flex flex-wrap items-start justify-between gap-3"><PanelHead icon={<BarChart3 />} title={t("reports.charts.freelancerWeeklyTitle")} /><span className="rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-[10px] font-bold text-[var(--accent-strong)]">{t("reports.charts.lastSevenDays")}</span></div><p className="text-[10px] leading-6 text-[var(--text-muted)]">{t("reports.charts.freelancerWeeklyDescription")}</p><ChartLegend className="mb-3 mt-3" items={[{ label: t("reports.charts.registeredTime"), color: CHART_COLORS.time }, { label: t("common.income"), color: CHART_COLORS.income, dashed: true }]} />{hasData ? <div className="overflow-x-auto pb-1 [scrollbar-width:thin]"><div className="h-[300px] min-w-[560px] sm:min-w-0" role="img" aria-label={t("reports.charts.freelancerWeeklyAria")}><ResponsiveContainer width="100%" height="100%"><ComposedChart data={data} margin={{ top: 10, right: 2, bottom: 2, left: 2 }}><CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 6" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "inherit" }} tickMargin={12} /><YAxis yAxisId="time" orientation={direction === "rtl" ? "right" : "left"} axisLine={false} tickLine={false} width={48} tick={{ fill: "var(--text-muted)", fontSize: 9, fontFamily: "inherit" }} tickFormatter={(value: number) => duration(value)} /><YAxis yAxisId="income" orientation={direction === "rtl" ? "left" : "right"} axisLine={false} tickLine={false} width={58} tick={{ fill: "var(--text-muted)", fontSize: 9, fontFamily: "inherit" }} tickFormatter={compactIncome} /><Tooltip cursor={{ fill: "var(--accent-soft)", radius: 8 }} content={<FreelancerWeeklyTooltip />} /><Bar yAxisId="time" dataKey="minutes" name={t("reports.charts.registeredTime")} fill={CHART_COLORS.time} radius={[6, 6, 2, 2]} maxBarSize={28} /><Line yAxisId="income" type="monotone" dataKey="income" name={t("common.income")} stroke={CHART_COLORS.income} strokeWidth={2.5} dot={{ r: 3, fill: "var(--surface-1)", stroke: CHART_COLORS.income, strokeWidth: 2 }} activeDot={{ r: 5, fill: CHART_COLORS.income, stroke: "var(--surface-1)", strokeWidth: 3 }} /></ComposedChart></ResponsiveContainer></div></div> : <ChartEmptyState icon={<BarChart3 className="size-5" />} title={t("month.weekly.empty")} description={t("reports.charts.freelancerWeeklyEmptyHint")} />}</ChartShell>;
}
