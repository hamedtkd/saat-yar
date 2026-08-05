"use client";

import { BarChart3, Info } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { SurfaceCard } from "@/components/common/surface-card";
import { WeeklyChartVisual } from "./weekly-chart/weekly-chart-visual";
import { WeeklyEmptyState } from "./weekly-chart/weekly-empty-state";
import { WeeklySummary } from "./weekly-chart/weekly-summary";
import { useWeeklyChartData } from "./weekly-chart/use-weekly-chart-data";
import type { WeeklyChartProps } from "./weekly-chart/types";

export function WeeklyChart({ values }: WeeklyChartProps) {
  const summary = useWeeklyChartData(values);

  return (
    <SurfaceCard as="aside" className="flex min-w-0 flex-col p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PanelHead icon={<BarChart3 />} title="کارکرد هفتگی" />
        <span className="rounded-full bg-[#f1f7f5] px-3 py-1.5 text-[10px] font-bold text-[#526b75]">
          ۷ روز هفته
        </span>
      </div>

      <p className="mt-1 text-[10px] leading-6 text-[#6c7d89]">
        مقایسه کارکرد ثبت‌شده در روزهای مختلف هفته
      </p>

      {summary.hasData ? (
        <>
          <WeeklyChartVisual data={summary.data} />
          <WeeklySummary
            totalMinutes={summary.totalMinutes}
            averageMinutes={summary.averageMinutes}
            bestDay={summary.bestDay}
          />
        </>
      ) : (
        <WeeklyEmptyState />
      )}

      <p className="mt-4 flex items-start gap-2 text-[10px] leading-7 text-[#6c7d89]">
        <Info className="mt-1 size-3.5 shrink-0" />
        <span>
          نمودار از رکوردهای همین ماه محاسبه می‌شود و داده مشتق‌شده جداگانه
          ذخیره نمی‌گردد.
        </span>
      </p>
    </SurfaceCard>
  );
}
