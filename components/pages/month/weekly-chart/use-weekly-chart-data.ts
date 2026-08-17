"use client";

import { useMemo } from "react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { getHolidayInfo } from "@/lib/holidays";
import { calc } from "@/lib/time-engine";
import { getDailyTargetMinutes } from "@/lib/work-schedule";
import type { AppData } from "@/lib/types";
import type { WeeklyChartItem, WeeklyChartSummary } from "./types";
import { getSelectedWeekDateKeys } from "./week-range";

const WEEK_KEYS = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"] as const;


export function useWeeklyChartData(data: AppData, selectedDate: string): WeeklyChartSummary {
  const { t, date, locale } = useLocaleUi();
  return useMemo(() => {
    const dateKeys = getSelectedWeekDateKeys(selectedDate);
    const rows: WeeklyChartItem[] = dateKeys.map((dateKey, index) => {
      const record = data.records[dateKey];
      const leave = data.leaves.some((entry) => entry.startDate <= dateKey && entry.endDate >= dateKey);
      const holidayInfo = getHolidayInfo(dateKey, {
        mode: data.settings.mode,
        manualHoliday: record?.holiday,
        includeOfficialHolidays: data.settings.autoOfficialHolidays,
        includeWeeklyHoliday: data.settings.autoWeeklyHoliday,
        overrides: data.holidayOverrides,
      });
      const effectiveRecord = record ? { ...record, holiday: holidayInfo.isHoliday } : undefined;
      const result = effectiveRecord ? calc(effectiveRecord, getDailyTargetMinutes(dateKey, data.settings)) : null;
      return {
        dateKey,
        day: t(`weekday.${WEEK_KEYS[index]}.short`),
        dayFull: t(`weekday.${WEEK_KEYS[index]}`),
        dateLabel: date(dateKey, { month: "short", day: "numeric" }),
        minutes: Math.max(0, result?.worked ?? 0),
        holiday: holidayInfo.isHoliday,
        holidayLabel: holidayInfo.isHoliday ? (locale === "fa-IR" && holidayInfo.title ? holidayInfo.title : t("common.holiday")) : "",
        leave,
        selected: dateKey === selectedDate,
      };
    });
    const totalMinutes = rows.reduce((sum, item) => sum + item.minutes, 0);
    const bestDay = rows.filter((item) => item.minutes > 0).reduce<WeeklyChartItem | null>((best, item) => (!best || item.minutes > best.minutes ? item : best), null);
    return {
      data: rows,
      hasData: rows.some((item) => item.minutes > 0 || item.holiday || item.leave),
      totalMinutes,
      averageMinutes: rows.length > 0 ? Math.round(totalMinutes / rows.length) : 0,
      bestDay,
    };
  }, [data.holidayOverrides, data.leaves, data.records, data.settings, date, locale, selectedDate, t]);
}
