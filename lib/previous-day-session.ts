import type { Settings, WorkRecord } from "./types.ts";
import { getWorkScheduleDay } from "./work-schedule.ts";

export function findPreviousOpenRecord(
  records: Record<string, WorkRecord>,
  selectedDate: string,
): WorkRecord | undefined {
  return Object.values(records)
    .filter((record) => record.date < selectedDate && record.start && !record.end)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function closePreviousRecordForNewDay(
  record: WorkRecord,
  settings: Settings,
  closedAt = new Date(),
): WorkRecord {
  const schedule = getWorkScheduleDay(record.date, settings);
  return {
    ...record,
    end: schedule.end || settings.defaultEnd,
    endedAt: closedAt.toISOString(),
    autoClosedAt: closedAt.toISOString(),
    autoClosedReason: "day-rollover",
    needsReview: true,
    updatedAt: closedAt.toISOString(),
  };
}
