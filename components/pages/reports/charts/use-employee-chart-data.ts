import { useMemo } from "react";

import { calc } from "@/lib/time-engine";
import type { Settings, WorkRecord } from "@/lib/types";
import { CHART_COLORS, formatPersianDayNumber, formatShortDate, getDailyTarget, parseLocalDate } from "./chart-utils";
import type { EmployeeChartItem, MonthStats } from "./types";

export function useEmployeeChartData(
  monthRecords: WorkRecord[],
  monthStats: MonthStats,
  settings: Settings,
) {
  const dailyTarget = getDailyTarget(settings);
  const daily = useMemo<EmployeeChartItem[]>(() => (
    [...monthRecords]
      .sort((first, second) => first.date.localeCompare(second.date))
      .map((record) => {
        const date = parseLocalDate(record.date);
        const result = calc(record, dailyTarget);
        return {
          key: record.date,
          day: formatPersianDayNumber(date),
          fullDate: formatShortDate(date),
          worked: result.worked,
          target: result.target,
          balance: result.balance,
        };
      })
  ), [dailyTarget, monthRecords]);

  const overtime = Math.max(0, monthStats.balance);
  const deficit = Math.max(0, -monthStats.balance);
  const completed = Math.min(monthStats.worked, monthStats.target);
  const remaining = Math.max(0, monthStats.target - monthStats.worked);
  const ratio = monthStats.target > 0
    ? Math.round((monthStats.worked / monthStats.target) * 100)
    : 0;
  const performance = monthStats.balance >= 0
    ? [
        { name: "ساعت موظفی تکمیل‌شده", value: completed, color: CHART_COLORS.target },
        { name: "اضافه‌کاری", value: overtime, color: CHART_COLORS.overtime },
      ]
    : [
        { name: "کارکرد انجام‌شده", value: completed, color: CHART_COLORS.worked },
        { name: "کسری کار", value: deficit || remaining, color: CHART_COLORS.deficit },
      ];

  return { daily, performance, ratio };
}
