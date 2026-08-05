import { BarChart3, BriefcaseBusiness } from "lucide-react";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PanelHead } from "@/components/common/panel-head";
import { duration } from "@/lib/format";
import { CHART_COLORS } from "./chart-utils";
import { ChartShell } from "./chart-shell";
import { EmployeeDailyTooltip } from "./chart-tooltips";
import type { EmployeeChartItem } from "./types";

export function EmployeeDailyChart({ data }: { data: EmployeeChartItem[] }) {
  return (
    <ChartShell>
      <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
        <PanelHead icon={<BarChart3 />} title="کارکرد روزانه در برابر موظفی" />
        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-[10px] font-bold text-[var(--text-muted)]">ماه جاری</span>
      </div>
      <p className="mb-4 text-[10px] leading-6 text-[var(--text-muted)]">ستون سبز کارکرد خالص و خط آبی ساعت موظفی هر روز را نشان می‌دهد.</p>
      {data.length ? (
        <div className="h-[320px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 12, right: 4, bottom: 2, left: 4 }}>
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="4 5" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "inherit" }} tickMargin={12} minTickGap={8} />
              <YAxis orientation="right" axisLine={false} tickLine={false} width={52} tick={{ fill: "var(--text-muted)", fontSize: 9, fontFamily: "inherit" }} tickFormatter={(value: number) => duration(value)} />
              <Tooltip cursor={{ fill: "rgba(7,155,96,0.045)", radius: 10 }} content={<EmployeeDailyTooltip />} />
              <Legend verticalAlign="top" align="left" iconType="circle" iconSize={8} wrapperStyle={{ direction: "rtl", fontSize: 11, paddingBottom: 18, color: "var(--text-muted)" }} formatter={(value: string) => <span className="mr-1 text-[11px] font-semibold text-[var(--text-muted)]">{value}</span>} />
              <Bar dataKey="worked" name="کارکرد خالص" fill={CHART_COLORS.worked} radius={[7, 7, 2, 2]} maxBarSize={28} />
              <Line type="monotone" dataKey="target" name="ساعت موظفی" stroke={CHART_COLORS.target} strokeWidth={3} dot={{ r: 3, fill: "var(--surface-1)", stroke: CHART_COLORS.target, strokeWidth: 2 }} activeDot={{ r: 5, fill: CHART_COLORS.target, stroke: "var(--surface-1)", strokeWidth: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="grid min-h-[320px] place-items-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-6 text-center">
          <div><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><BriefcaseBusiness className="size-5" /></span><strong className="mt-3 block text-sm font-extrabold text-[var(--text)]">هنوز کارکردی ثبت نشده است</strong><p className="mt-1 text-[10px] leading-6 text-[var(--text-muted)]">بعد از ثبت ورود و خروج، نمودار کارکرد روزانه اینجا نمایش داده می‌شود.</p></div>
        </div>
      )}
    </ChartShell>
  );
}
