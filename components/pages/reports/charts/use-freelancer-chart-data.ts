import { useMemo } from "react";

import { entryMinutes } from "@/lib/format";
import type { TimeEntry } from "@/lib/types";
import { CHART_COLORS, formatShortDate, localDateKey, WEEKDAY_LABELS } from "./chart-utils";
import type { FreelancerChartItem } from "./types";

export function useFreelancerChartData(entries: TimeEntry[], reportBillable: number) {
  const weekly = useMemo<FreelancerChartItem[]>(() => {
    const now = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now);
      date.setHours(12, 0, 0, 0);
      date.setDate(now.getDate() - (6 - index));
      return {
        key: localDateKey(date), date,
        day: WEEKDAY_LABELS[date.getDay()],
        fullDate: formatShortDate(date), minutes: 0, income: 0,
      };
    });
    const daysByKey = new Map(days.map((item) => [item.key, item]));
    for (const entry of entries) {
      const day = daysByKey.get(localDateKey(new Date(entry.startedAt)));
      if (!day) continue;
      const minutes = entryMinutes(entry);
      day.minutes += minutes;
      if (entry.billable) day.income += (minutes / 60) * Math.max(0, entry.effectiveRate);
    }
    return days.map(({ date: _date, ...item }) => item);
  }, [entries]);

  const allMinutes = useMemo(
    () => entries.reduce((sum, entry) => sum + entryMinutes(entry), 0),
    [entries],
  );
  const nonBillable = Math.max(0, allMinutes - reportBillable);
  const ratio = allMinutes > 0 ? Math.round((reportBillable / allMinutes) * 100) : 0;
  const billing = [
    { name: "قابل صورتحساب", value: reportBillable, color: CHART_COLORS.billable },
    { name: "غیرقابل صورتحساب", value: nonBillable, color: CHART_COLORS.nonBillable },
  ];

  return {
    weekly,
    billing,
    allMinutes,
    ratio,
    hasWeeklyData: weekly.some((item) => item.minutes > 0 || item.income > 0),
  };
}
