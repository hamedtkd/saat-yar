"use client";

import { useMemo } from "react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { entryMinutes } from "@/lib/format";
import type { TimeEntry } from "@/lib/types";
import { CHART_COLORS, localDateKey } from "./chart-utils";
import type { FreelancerChartItem } from "./types";

export function useFreelancerChartData(entries: TimeEntry[], reportBillable: number) {
  const { t, date } = useLocaleUi();
  const weekly = useMemo<FreelancerChartItem[]>(() => {
    const now = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
      const current = new Date(now); current.setHours(12, 0, 0, 0); current.setDate(now.getDate() - (6 - index));
      return { key: localDateKey(current), date: current, day: date(current.toISOString(), { weekday: "long" }), fullDate: date(current.toISOString(), { month: "short", day: "numeric" }), minutes: 0, income: 0 };
    });
    const daysByKey = new Map(days.map((item) => [item.key, item]));
    for (const entry of entries) { const day = daysByKey.get(localDateKey(new Date(entry.startedAt))); if (!day) continue; const minutes = entryMinutes(entry); day.minutes += minutes; if (entry.billable) day.income += (minutes / 60) * Math.max(0, entry.effectiveRate); }
    return days.map(({ key, day, fullDate, minutes, income }) => ({ key, day, fullDate, minutes, income }));
  }, [date, entries]);
  const allMinutes = useMemo(() => entries.reduce((sum, entry) => sum + entryMinutes(entry), 0), [entries]);
  const nonBillable = Math.max(0, allMinutes - reportBillable);
  const ratio = allMinutes > 0 ? Math.round((reportBillable / allMinutes) * 100) : 0;
  const billing = [{ name: t("common.billable"), value: reportBillable, color: CHART_COLORS.billable }, { name: t("common.nonBillable"), value: nonBillable, color: CHART_COLORS.nonBillable }];
  return { weekly, billing, allMinutes, ratio, hasWeeklyData: weekly.some((item) => item.minutes > 0 || item.income > 0) };
}
