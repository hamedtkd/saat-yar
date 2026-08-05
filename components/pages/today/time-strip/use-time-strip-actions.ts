import { useCallback } from "react";

import { nowTime } from "@/lib/format";
import { spanMinutes } from "@/lib/time-engine";
import type { BreakItem, WorkRecord } from "@/lib/types";

import type { TodayTimeStripProps } from "./types";

type ActionProps = Pick<TodayTimeStripProps, "record" | "updateRecord">;

export function useTimeStripActions({ record, updateRecord }: ActionProps) {
  const updateLunch = useCallback((patch: Partial<WorkRecord>) => {
    const next = { ...record, ...patch };
    const lunchMinutes = next.lunchStart && next.lunchEnd &&
      ("lunchStart" in patch || "lunchEnd" in patch)
      ? spanMinutes(next.lunchStart, next.lunchEnd)
      : next.lunchMinutes;
    updateRecord({ ...patch, lunchMinutes });
  }, [record, updateRecord]);

  const updateBreak = useCallback((id: string, patch: Partial<BreakItem>) => {
    updateRecord({
      breaks: record.breaks.map((item) => item.id === id ? {
        ...item,
        ...patch,
        ...("start" in patch || "end" in patch ? { startedAt: undefined, endedAt: undefined } : {}),
      } : item),
    });
  }, [record.breaks, updateRecord]);

  const addBreak = useCallback(() => {
    const start = nowTime();
    updateRecord({
      breaks: [...record.breaks, {
        id: crypto.randomUUID(), start, end: start, title: "وقفه شخصی", paid: false,
      }],
    });
  }, [record.breaks, updateRecord]);

  const removeBreak = useCallback((id: string) => {
    updateRecord({ breaks: record.breaks.filter((item) => item.id !== id) });
  }, [record.breaks, updateRecord]);

  return { updateLunch, updateBreak, addBreak, removeBreak };
}
