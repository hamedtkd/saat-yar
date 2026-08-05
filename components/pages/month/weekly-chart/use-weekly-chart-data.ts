import { useMemo } from "react";
import type { WeeklyChartItem, WeeklyChartSummary } from "./types";

const WEEK_DAYS = [
  { short: "ش", full: "شنبه" },
  { short: "ی", full: "یکشنبه" },
  { short: "د", full: "دوشنبه" },
  { short: "س", full: "سه‌شنبه" },
  { short: "چ", full: "چهارشنبه" },
  { short: "پ", full: "پنجشنبه" },
  { short: "ج", full: "جمعه" },
];

export function useWeeklyChartData(values: number[]): WeeklyChartSummary {
  return useMemo(() => {
    const data: WeeklyChartItem[] = WEEK_DAYS.map((day, index) => ({
      day: day.short,
      dayFull: day.full,
      minutes: Math.max(0, values[index] ?? 0),
    }));
    const totalMinutes = data.reduce((sum, item) => sum + item.minutes, 0);
    const bestDay = data.reduce<WeeklyChartItem | null>(
      (best, item) => (!best || item.minutes > best.minutes ? item : best),
      null,
    );

    return {
      data,
      hasData: data.some((item) => item.minutes > 0),
      totalMinutes,
      averageMinutes: data.length > 0 ? Math.round(totalMinutes / data.length) : 0,
      bestDay,
    };
  }, [values]);
}
