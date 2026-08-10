import { useCallback } from "react";

import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { nowTime } from "@/lib/format";
import { spanMinutes } from "@/lib/time-engine";
import type { BreakItem, WorkRecord } from "@/lib/types";

import type { TodayTimeStripProps } from "./types";

type ActionProps = Pick<TodayTimeStripProps, "updateRecord">;

export function useTimeStripActions({ updateRecord }: ActionProps) {
  const { t } = useLocaleUi();
  const updateLunch = useCallback((patch: Partial<WorkRecord>) => {
    updateRecord((current) => {
      const next = { ...current, ...patch };
      const lunchMinutes = next.lunchStart && next.lunchEnd &&
        ("lunchStart" in patch || "lunchEnd" in patch)
        ? spanMinutes(next.lunchStart, next.lunchEnd)
        : next.lunchMinutes;
      return { ...patch, lunchMinutes };
    });
  }, [updateRecord]);

  const updateBreak = useCallback((id: string, patch: Partial<BreakItem>) => {
    updateRecord((current) => ({
      breaks: current.breaks.map((item) => item.id === id ? {
        ...item,
        ...patch,
        ...("start" in patch || "end" in patch ? { startedAt: undefined, endedAt: undefined } : {}),
      } : item),
    }));
  }, [updateRecord]);

  const addBreak = useCallback(() => {
    const start = nowTime();
    updateRecord((current) => ({
      breaks: [...current.breaks, {
        id: crypto.randomUUID(), start, end: start, title: t("today.time.defaultBreak"), paid: false,
      }],
    }));
  }, [t, updateRecord]);

  const removeBreak = useCallback((id: string) => {
    updateRecord((current) => ({ breaks: current.breaks.filter((item) => item.id !== id) }));
  }, [updateRecord]);

  return { updateLunch, updateBreak, addBreak, removeBreak };
}
