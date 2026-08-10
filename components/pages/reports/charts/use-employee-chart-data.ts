"use client";

import { useMemo } from "react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { calc } from "@/lib/time-engine";
import type { Settings, WorkRecord } from "@/lib/types";
import { CHART_COLORS, getDailyTarget, parseLocalDate } from "./chart-utils";
import type { EmployeeChartItem, MonthStats } from "./types";

export function useEmployeeChartData(monthRecords: WorkRecord[], monthStats: MonthStats, settings: Settings) {
  const { t, date } = useLocaleUi();
  const dailyTarget = getDailyTarget(settings);
  const daily = useMemo<EmployeeChartItem[]>(() => [...monthRecords].sort((first, second) => first.date.localeCompare(second.date)).map((record) => {
    const parsed = parseLocalDate(record.date);
    const result = calc(record, dailyTarget);
    return { key: record.date, day: date(record.date, { day: "numeric" }), fullDate: date(parsed.toISOString(), { month: "short", day: "numeric" }), worked: result.worked, target: result.target, balance: result.balance };
  }), [dailyTarget, date, monthRecords]);
  const overtime = Math.max(0, monthStats.balance);
  const deficit = Math.max(0, -monthStats.balance);
  const completed = Math.min(monthStats.worked, monthStats.target);
  const remaining = Math.max(0, monthStats.target - monthStats.worked);
  const ratio = monthStats.target > 0 ? Math.round((monthStats.worked / monthStats.target) * 100) : 0;
  const performance = monthStats.balance >= 0
    ? [{ name: t("common.targetHours"), value: completed, color: CHART_COLORS.target }, { name: t("common.overtime"), value: overtime, color: CHART_COLORS.overtime }]
    : [{ name: t("common.worked"), value: completed, color: CHART_COLORS.worked }, { name: t("common.deficit"), value: deficit || remaining, color: CHART_COLORS.deficit }];
  return { daily, performance, ratio };
}
