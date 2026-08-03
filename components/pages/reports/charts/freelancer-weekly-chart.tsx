import { BarChart3 } from "lucide-react";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PanelHead } from "@/components/common/panel-head";
import { duration } from "@/lib/format";
import { CHART_COLORS, compactMoney } from "./chart-utils";
import { ChartShell } from "./chart-shell";
import { FreelancerWeeklyTooltip } from "./chart-tooltips";
import type { FreelancerChartItem } from "./types";

export function FreelancerWeeklyChart({ data, hasData }: { data: FreelancerChartItem[]; hasData: boolean }) {
  return (
    <ChartShell>
      <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
        <PanelHead icon={<BarChart3 />} title="روند زمان و درآمد هفتگی" />
        <span className="rounded-full bg-[#f1f7f5] px-3 py-1.5 text-[10px] font-bold text-[#526b75]">۷ روز اخیر</span>
      </div>
      <p className="mb-4 text-[10px] leading-6 text-[#6c7d89]">ستون سبز زمان ثبت‌شده و خط آبی درآمد قابل‌صورتحساب روزانه را نشان می‌دهد.</p>
      {hasData ? (
        <div className="h-[300px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 12, right: 4, bottom: 2, left: 4 }}>
              <CartesianGrid vertical={false} stroke="#edf2f3" strokeDasharray="4 5" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#6c7d89", fontSize: 10, fontFamily: "inherit" }} tickMargin={12} />
              <YAxis yAxisId="time" orientation="right" axisLine={false} tickLine={false} width={48} tick={{ fill: "#6c7d89", fontSize: 9, fontFamily: "inherit" }} tickFormatter={(value: number) => duration(value)} />
              <YAxis yAxisId="income" orientation="left" axisLine={false} tickLine={false} width={58} tick={{ fill: "#6c7d89", fontSize: 9, fontFamily: "inherit" }} tickFormatter={compactMoney} />
              <Tooltip cursor={{ fill: "rgba(7,155,96,0.045)", radius: 10 }} content={<FreelancerWeeklyTooltip />} />
              <Legend verticalAlign="top" align="left" iconType="circle" iconSize={8} wrapperStyle={{ direction: "rtl", fontSize: 11, paddingBottom: 18, color: "#526b75" }} formatter={(value: string) => <span className="mr-1 text-[11px] font-semibold text-[#526b75]">{value}</span>} />
              <Bar yAxisId="time" dataKey="minutes" name="زمان ثبت‌شده" fill={CHART_COLORS.time} radius={[7, 7, 2, 2]} maxBarSize={30} />
              <Line yAxisId="income" type="monotone" dataKey="income" name="درآمد" stroke={CHART_COLORS.income} strokeWidth={3} dot={{ r: 4, fill: "#ffffff", stroke: CHART_COLORS.income, strokeWidth: 2 }} activeDot={{ r: 6, fill: CHART_COLORS.income, stroke: "#ffffff", strokeWidth: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="grid min-h-[300px] place-items-center rounded-xl border border-dashed border-[#d7e2e4] bg-[#fbfdfc] p-6 text-center"><div><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#edf9f4] text-[#079b60]"><BarChart3 className="size-5" /></span><strong className="mt-3 block text-sm font-extrabold text-[#173747]">هنوز داده‌ای برای نمودار وجود ندارد</strong><p className="mt-1 text-[10px] leading-6 text-[#6c7d89]">با ثبت زمان پروژه‌ها، روند هفتگی اینجا نمایش داده می‌شود.</p></div></div>
      )}
    </ChartShell>
  );
}
