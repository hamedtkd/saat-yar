"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import type { WeeklyChartItem } from "./types";
import { WeeklyTooltip } from "./weekly-tooltip";
import { MONTH_CHART_THEME } from "./chart-theme";

type WeeklyChartVisualProps = { data: WeeklyChartItem[] };

export function WeeklyChartVisual({ data }: WeeklyChartVisualProps) {
  const { t, duration, direction } = useLocaleUi();
  return (
    <div className="mt-4 h-[290px] w-full min-w-0 max-[900px]:h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 4, bottom: 0, left: 4 }}>
          <CartesianGrid vertical={false} stroke={MONTH_CHART_THEME.grid} strokeDasharray="4 5" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: MONTH_CHART_THEME.text, fontSize: 10, fontFamily: "inherit" }} tickMargin={10} />
          <YAxis orientation={direction === "rtl" ? "right" : "left"} axisLine={false} tickLine={false} width={50} tick={{ fill: MONTH_CHART_THEME.text, fontSize: 9, fontFamily: "inherit" }} tickFormatter={(value: number) => duration(value)} />
          <Tooltip cursor={{ fill: MONTH_CHART_THEME.cursor, radius: 10 }} content={<WeeklyTooltip />} />
          <Legend verticalAlign="top" align={direction === "rtl" ? "left" : "right"} iconType="circle" iconSize={8} wrapperStyle={{ direction, fontSize: 11, paddingBottom: 16, color: MONTH_CHART_THEME.text }} formatter={() => <span className="mx-1 text-[11px] font-semibold text-[var(--text-muted)]">{t("month.weekly.dailyWork")}</span>} />
          <Bar dataKey="minutes" name={t("month.weekly.dailyWork")} fill={MONTH_CHART_THEME.accent} radius={[8, 8, 3, 3]} maxBarSize={34} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
