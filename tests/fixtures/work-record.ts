import type { WorkRecord } from "../../lib/types.ts";

export function makeWorkRecord(overrides: Partial<WorkRecord> = {}): WorkRecord {
  return {
    date: "2026-08-06",
    start: "08:00",
    end: "16:00",
    lunchMinutes: 0,
    lunchPaid: false,
    breaks: [],
    activitySegments: [],
    leaveMinutes: 0,
    leaveType: "none",
    note: "",
    holiday: false,
    ...overrides,
  };
}
