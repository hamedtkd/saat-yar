"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { duration } from "@/lib/format";
import type { WeeklyChartItem } from "./types";
import { WeeklyTooltip } from "./weekly-tooltip";

type WeeklyChartVisualProps = {
  data: WeeklyChartItem[];
};

export function WeeklyChartVisual({ data }: WeeklyChartVisualProps) {
  return (
    <div className="mt-4 h-[290px] w-full min-w-0 max-[900px]:h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 4, bottom: 0, left: 4 }}>
          <CartesianGrid vertical={false} stroke="#edf2f3" strokeDasharray="4 5" />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6c7d89", fontSize: 10, fontFamily: "inherit" }}
            tickMargin={10}
          />
          <YAxis
            orientation="right"
            axisLine={false}
            tickLine={false}
            width={50}
            tick={{ fill: "#6c7d89", fontSize: 9, fontFamily: "inherit" }}
            tickFormatter={(value: number) => duration(value)}
          />
          <Tooltip
            cursor={{ fill: "rgba(7,155,96,0.045)", radius: 10 }}
            content={<WeeklyTooltip />}
          />
          <Legend
            verticalAlign="top"
            align="left"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{
              direction: "rtl",
              fontSize: 11,
              paddingBottom: 16,
              color: "#526b75",
            }}
            formatter={() => (
              <span className="mr-1 text-[11px] font-semibold text-[var(--text-muted)]">
                کارکرد روزانه
              </span>
            )}
          />
          <Bar
            dataKey="minutes"
            name="کارکرد روزانه"
            fill="#079b60"
            radius={[8, 8, 3, 3]}
            maxBarSize={34}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
