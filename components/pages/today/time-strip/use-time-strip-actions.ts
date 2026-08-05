import { useCallback } from "react";

import { nowTime } from "@/lib/format";
import { spanMinutes } from "@/lib/time-engine";
import type { BreakItem, WorkRecord } from "@/lib/types";

import type { TodayTimeStripProps } from "./types";

type ActionProps = Pick<TodayTimeStripProps, "record" | "updateRecord">;

export function useTimeStripActions(props: ActionProps) {
  const updateLunch = useCallback((patch: Partial<WorkRecord>) => {
    const next = { ...props.record, ...patch };
    const lunchMinutes = next.lunchStart && next.lunchEnd &&
      ("lunchStart" in patch || "lunchEnd" in patch)
      ? spanMinutes(next.lunchStart, next.lunchEnd)
      : next.lunchMinutes;
    props.updateRecord({ ...patch, lunchMinutes });
  }, [props.record, props.updateRecord]);

  const updateBreak = useCallback((id: string, patch: Partial<BreakItem>) => {
    props.updateRecord({
      breaks: props.record.breaks.map((item) => item.id === id ? {
        ...item,
        ...patch,
        ...("start" in patch || "end" in patch ? { startedAt: undefined, endedAt: undefined } : {}),
      } : item),
    });
  }, [props.record.breaks, props.updateRecord]);

  const addBreak = useCallback(() => {
    const start = nowTime();
    props.updateRecord({
      breaks: [...props.record.breaks, {
        id: crypto.randomUUID(), start, end: start, title: "وقفه شخصی", paid: false,
      }],
    });
  }, [props.record.breaks, props.updateRecord]);

  const removeBreak = useCallback((id: string) => {
    props.updateRecord({ breaks: props.record.breaks.filter((item) => item.id !== id) });
  }, [props.record.breaks, props.updateRecord]);

  return { updateLunch, updateBreak, addBreak, removeBreak };
}
