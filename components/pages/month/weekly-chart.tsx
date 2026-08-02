"use client";

import { useMemo } from "react";
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
import { BarChart3, Info } from "lucide-react";

import { PanelHead } from "@/components/common/panel-head";
import { cn } from "@/lib/cn";
import { duration, fa } from "@/lib/format";
import { SummaryRow } from "@/components/common/summary-row";

type WeeklyChartProps = {
  values: number[];
};

type WeeklyChartItem = {
  day: string;
  dayFull: string;
  minutes: number;
};

type TooltipPayloadItem = {
  dataKey?: string;
  value?: number;
  payload?: WeeklyChartItem;
};

type WeeklyTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: TooltipPayloadItem[];
};

const WEEK_DAYS = [
  { short: "ش", full: "شنبه" },
  { short: "ی", full: "یکشنبه" },
  { short: "د", full: "دوشنبه" },
  { short: "س", full: "سه‌شنبه" },
  { short: "چ", full: "چهارشنبه" },
  { short: "پ", full: "پنجشنبه" },
  { short: "ج", full: "جمعه" },
];

function WeeklyTooltip({ active, payload }: WeeklyTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload;
  const minutes = payload[0]?.value ?? 0;

  return (
    <div
      dir="rtl"
      className={cn(
        "min-w-40 rounded-xl border border-[#dfe7e9]",
        "bg-white/98 p-3",
        "shadow-[0_16px_45px_rgba(17,45,55,0.16)]",
        "backdrop-blur-xl",
      )}
    >
      <strong className="block text-xs font-extrabold text-[#102a3a]">
        {item?.dayFull}
      </strong>

      <div className="mt-2 flex items-center justify-between gap-6">
        <span className="flex items-center gap-2 text-[11px] text-[#526b75]">
          <i className="size-2 rounded-full bg-[#079b60]" />
          کارکرد
        </span>

        <strong dir="ltr" className="text-xs font-extrabold text-[#102a3a]">
          {duration(minutes)}
        </strong>
      </div>
    </div>
  );
}

export function WeeklyChart({ values }: WeeklyChartProps) {
  const chartData = useMemo<WeeklyChartItem[]>(
    () =>
      WEEK_DAYS.map((day, index) => ({
        day: day.short,
        dayFull: day.full,
        minutes: Math.max(0, values[index] ?? 0),
      })),
    [values],
  );

  const hasData = chartData.some((item) => item.minutes > 0);

  const totalMinutes = chartData.reduce((sum, item) => sum + item.minutes, 0);

  const averageMinutes =
    chartData.length > 0 ? Math.round(totalMinutes / chartData.length) : 0;

  const bestDay = chartData.reduce<WeeklyChartItem | null>((best, item) => {
    if (!best || item.minutes > best.minutes) {
      return item;
    }

    return best;
  }, null);

  return (
    <aside
      className={cn(
        "flex min-w-0 flex-col rounded-2xl",
        "border border-[#dfe7e9]",
        "bg-white/95 p-4",
        "shadow-[0_10px_35px_rgba(17,45,55,0.055)]",
        "sm:p-5",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PanelHead icon={<BarChart3 />} title="کارکرد هفتگی" />

        <span className="rounded-full bg-[#f1f7f5] px-3 py-1.5 text-[10px] font-bold text-[#526b75]">
          ۷ روز هفته
        </span>
      </div>

      <p className="mt-1 text-[10px] leading-6 text-[#6c7d89]">
        مقایسه کارکرد ثبت‌شده در روزهای مختلف هفته
      </p>

      {hasData ? (
        <>
          <div className="mt-4 h-[290px] w-full min-w-0 max-[900px]:h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 4,
                  bottom: 0,
                  left: 4,
                }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="#edf2f3"
                  strokeDasharray="4 5"
                />

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#6c7d89",
                    fontSize: 10,
                    fontFamily: "inherit",
                  }}
                  tickMargin={10}
                />

                <YAxis
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  width={50}
                  tick={{
                    fill: "#6c7d89",
                    fontSize: 9,
                    fontFamily: "inherit",
                  }}
                  tickFormatter={(value: number) => duration(value)}
                />

                <Tooltip
                  cursor={{
                    fill: "rgba(7,155,96,0.045)",
                    radius: 10,
                  }}
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
                    <span className="mr-1 text-[11px] font-semibold text-[#526b75]">
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

          <div className="mt-3 grid gap-2">
            <SummaryRow
              label="مجموع هفته"
              value={duration(totalMinutes)}
              valueClassName="tabular-nums"
            />

            <SummaryRow
              label="میانگین روزانه"
              value={duration(averageMinutes)}
              valueClassName="tabular-nums"
            />

            <SummaryRow
              label="بیشترین کارکرد"
              hint={bestDay?.dayFull}
              value={bestDay ? duration(bestDay.minutes) : "—"}
              valueClassName="tabular-nums"
            />
          </div>
        </>
      ) : (
        <div className="mt-4 grid min-h-[290px] place-items-center rounded-xl border border-dashed border-[#d7e2e4] bg-[#fbfdfc] p-6 text-center">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#edf9f4] text-[#079b60]">
              <BarChart3 className="size-5" />
            </span>

            <strong className="mt-3 block text-sm font-extrabold text-[#173747]">
              هنوز داده‌ای برای نمودار وجود ندارد
            </strong>

            <p className="mt-1 text-[10px] leading-6 text-[#6c7d89]">
              بعد از ثبت کارکرد، نمودار هفتگی اینجا نمایش داده می‌شود.
            </p>
          </div>
        </div>
      )}

      <p className="mt-4 flex items-start gap-2 text-[10px] leading-7 text-[#6c7d89]">
        <Info className="mt-1 size-3.5 shrink-0" />

        <span>
          نمودار از رکوردهای همین ماه محاسبه می‌شود و داده مشتق‌شده جداگانه
          ذخیره نمی‌گردد.
        </span>
      </p>
    </aside>
  );
}
