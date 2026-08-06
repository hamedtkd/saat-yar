import { BarChart3, BriefcaseBusiness } from "lucide-react";
import { Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PanelHead } from "@/components/common/panel-head";
import { duration } from "@/lib/format";
import { ChartEmptyState } from "./chart-empty-state";
import { ChartLegend } from "./chart-legend";
import { CHART_COLORS } from "./chart-utils";
import { ChartShell } from "./chart-shell";
import { EmployeeDailyTooltip } from "./chart-tooltips";
import type { EmployeeChartItem } from "./types";

export function EmployeeDailyChart({ data }: { data: EmployeeChartItem[] }) {
  return (
    <ChartShell>
      <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
        <PanelHead icon={<BarChart3 />} title="کارکرد روزانه در برابر موظفی" />
        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-[10px] font-bold text-[var(--accent-strong)]">ماه جاری</span>
      </div>
      <p className="text-[10px] leading-6 text-[var(--text-muted)]">محور افقی روزهای ماه شمسی است. برای دیدن جزئیات هر روز روی ستون بزن.</p>
      <ChartLegend className="mb-3 mt-3" items={[
        { label: "کارکرد خالص", color: CHART_COLORS.worked },
        { label: "ساعت موظفی", color: CHART_COLORS.target },
      ]} />
      {data.length ? (
        <div className="overflow-x-auto pb-1 [scrollbar-width:thin]">
          <div className="h-[310px] min-w-[620px] sm:min-w-0" role="img" aria-label="نمودار مقایسه کارکرد خالص و ساعت موظفی روزهای ماه">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 10, right: 2, bottom: 2, left: 2 }} barGap={4}>
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "inherit" }} tickMargin={12} minTickGap={6} />
                <YAxis orientation="right" axisLine={false} tickLine={false} width={50} tick={{ fill: "var(--text-muted)", fontSize: 9, fontFamily: "inherit" }} tickFormatter={(value: number) => duration(value)} />
                <Tooltip cursor={{ fill: "var(--accent-soft)", radius: 8 }} content={<EmployeeDailyTooltip />} />
                <Bar dataKey="target" name="ساعت موظفی" fill={CHART_COLORS.target} fillOpacity={0.22} radius={[6, 6, 2, 2]} maxBarSize={30} />
                <Bar dataKey="worked" name="کارکرد خالص" fill={CHART_COLORS.worked} radius={[6, 6, 2, 2]} maxBarSize={24} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <ChartEmptyState
          icon={<BriefcaseBusiness className="size-5" />}
          title="هنوز کارکردی ثبت نشده است"
          description="بعد از ثبت ورود و خروج، نمودار روزهای ماه با تاریخ شمسی اینجا نمایش داده می‌شود."
        />
      )}
    </ChartShell>
  );
}
