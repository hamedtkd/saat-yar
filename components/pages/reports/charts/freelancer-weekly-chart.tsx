import { BarChart3 } from "lucide-react";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PanelHead } from "@/components/common/panel-head";
import { duration } from "@/lib/format";
import { ChartEmptyState } from "./chart-empty-state";
import { ChartLegend } from "./chart-legend";
import { CHART_COLORS, compactMoney } from "./chart-utils";
import { ChartShell } from "./chart-shell";
import { FreelancerWeeklyTooltip } from "./chart-tooltips";
import type { FreelancerChartItem } from "./types";

export function FreelancerWeeklyChart({ data, hasData }: { data: FreelancerChartItem[]; hasData: boolean }) {
  return (
    <ChartShell>
      <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
        <PanelHead icon={<BarChart3 />} title="روند زمان و درآمد هفتگی" />
        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-[10px] font-bold text-[var(--accent-strong)]">۷ روز اخیر</span>
      </div>
      <p className="text-[10px] leading-6 text-[var(--text-muted)]">ستون‌ها زمان ثبت‌شده و خط، درآمد قابل‌صورتحساب هر روز را نشان می‌دهد. روی نمودار بزن تا جزئیات باز شود.</p>
      <ChartLegend className="mb-3 mt-3" items={[
        { label: "زمان ثبت‌شده", color: CHART_COLORS.time },
        { label: "درآمد", color: CHART_COLORS.income, dashed: true },
      ]} />
      {hasData ? (
        <div className="overflow-x-auto pb-1 [scrollbar-width:thin]">
          <div className="h-[300px] min-w-[560px] sm:min-w-0" role="img" aria-label="نمودار زمان و درآمد هفت روز اخیر">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 10, right: 2, bottom: 2, left: 2 }}>
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "inherit" }} tickMargin={12} />
                <YAxis yAxisId="time" orientation="right" axisLine={false} tickLine={false} width={48} tick={{ fill: "var(--text-muted)", fontSize: 9, fontFamily: "inherit" }} tickFormatter={(value: number) => duration(value)} />
                <YAxis yAxisId="income" orientation="left" axisLine={false} tickLine={false} width={58} tick={{ fill: "var(--text-muted)", fontSize: 9, fontFamily: "inherit" }} tickFormatter={compactMoney} />
                <Tooltip cursor={{ fill: "var(--accent-soft)", radius: 8 }} content={<FreelancerWeeklyTooltip />} />
                <Bar yAxisId="time" dataKey="minutes" name="زمان ثبت‌شده" fill={CHART_COLORS.time} radius={[6, 6, 2, 2]} maxBarSize={28} />
                <Line yAxisId="income" type="monotone" dataKey="income" name="درآمد" stroke={CHART_COLORS.income} strokeWidth={2.5} dot={{ r: 3, fill: "var(--surface-1)", stroke: CHART_COLORS.income, strokeWidth: 2 }} activeDot={{ r: 5, fill: CHART_COLORS.income, stroke: "var(--surface-1)", strokeWidth: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <ChartEmptyState
          icon={<BarChart3 className="size-5" />}
          title="هنوز داده‌ای برای نمودار وجود ندارد"
          description="با ثبت زمان پروژه‌ها، روند زمان و درآمد هفتگی اینجا نمایش داده می‌شود."
        />
      )}
    </ChartShell>
  );
}
