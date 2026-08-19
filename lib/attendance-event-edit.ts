import { spanMinutes } from "./time-engine.ts";
import type { BreakItem, WorkRecord } from "./types.ts";

export type AttendanceEventTarget =
  | { kind: "clock-in" }
  | { kind: "clock-out" }
  | { kind: "lunch" }
  | { kind: "break"; id: string };

export type AttendanceEventDraft = {
  start?: string;
  end?: string;
  title?: string;
  paid?: boolean;
};

function updatedBreak(item: BreakItem, draft: AttendanceEventDraft): BreakItem {
  const next = {
    ...item,
    ...(draft.start !== undefined ? { start: draft.start, startedAt: undefined } : {}),
    ...(draft.end !== undefined ? { end: draft.end, endedAt: undefined } : {}),
    ...(draft.title !== undefined ? { title: draft.title } : {}),
    ...(draft.paid !== undefined ? { paid: draft.paid } : {}),
  };
  return next;
}

export function applyAttendanceEventEdit(
  record: WorkRecord,
  target: AttendanceEventTarget,
  draft: AttendanceEventDraft,
): Partial<WorkRecord> {
  if (target.kind === "clock-in") {
    return draft.start === undefined ? {} : { start: draft.start, startedAt: undefined };
  }

  if (target.kind === "clock-out") {
    return draft.end === undefined ? {} : { end: draft.end, endedAt: undefined };
  }

  if (target.kind === "lunch") {
    const lunchStart = draft.start ?? record.lunchStart ?? "";
    const lunchEnd = draft.end ?? record.lunchEnd ?? "";
    const lunchMinutes = lunchStart && lunchEnd ? spanMinutes(lunchStart, lunchEnd) : record.lunchMinutes;
    return {
      ...(draft.start !== undefined ? { lunchStart: draft.start, lunchStartedAt: undefined } : {}),
      ...(draft.end !== undefined ? { lunchEnd: draft.end, lunchEndedAt: undefined } : {}),
      ...(draft.paid !== undefined ? { lunchPaid: draft.paid } : {}),
      lunchMinutes,
    };
  }

  return {
    breaks: record.breaks.map((item) => item.id === target.id ? updatedBreak(item, draft) : item),
  };
}
