import type { Settings, WorkRecord } from "./types.ts";
import { getWorkScheduleDay } from "./work-schedule.ts";
import { closeActiveActivitySegments } from "./activity-segments.ts";

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
  const fallbackClosedAt = settings.workTimingMode === "flexible"
    ? new Date(record.updatedAt ?? record.startedAt ?? closedAt.toISOString())
    : closedAt;
  const effectiveClosedAt = Number.isFinite(fallbackClosedAt.getTime()) ? fallbackClosedAt : closedAt;
  const endedAt = effectiveClosedAt.toISOString();
  const end = settings.workTimingMode === "flexible"
    ? `${String(effectiveClosedAt.getHours()).padStart(2, "0")}:${String(effectiveClosedAt.getMinutes()).padStart(2, "0")}`
    : schedule.end || settings.defaultEnd;
  return {
    ...record,
    end,
    endedAt,
    activitySegments: closeActiveActivitySegments(record.activitySegments, end, endedAt),
    autoClosedAt: closedAt.toISOString(),
    autoClosedReason: "day-rollover",
    needsReview: true,
    updatedAt: closedAt.toISOString(),
  };
}
