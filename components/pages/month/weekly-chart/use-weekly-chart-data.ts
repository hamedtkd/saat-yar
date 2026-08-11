"use client";

import { useMemo } from "react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import type { WeeklyChartItem, WeeklyChartSummary } from "./types";

const WEEK_KEYS = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"] as const;

export function useWeeklyChartData(values: number[]): WeeklyChartSummary {
  const { t } = useLocaleUi();
  return useMemo(() => {
    const data: WeeklyChartItem[] = WEEK_KEYS.map((day, index) => ({
      day: t(`weekday.${day}.short`),
      dayFull: t(`weekday.${day}`),
      minutes: Math.max(0, values[index] ?? 0),
    }));
    const totalMinutes = data.reduce((sum, item) => sum + item.minutes, 0);
    const bestDay = data.reduce<WeeklyChartItem | null>((best, item) => (!best || item.minutes > best.minutes ? item : best), null);
    return { data, hasData: data.some((item) => item.minutes > 0), totalMinutes, averageMinutes: data.length > 0 ? Math.round(totalMinutes / data.length) : 0, bestDay };
  }, [t, values]);
}
