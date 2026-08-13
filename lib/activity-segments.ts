import { spanMinutes } from "./time-engine.ts";
import type { ActivityKind, ActivitySegment, WorkRecord } from "./types.ts";

export const activityKinds: ActivityKind[] = [
  "deep-work",
  "meeting",
  "learning",
  "admin",
  "project",
  "other",
];

function timestampMinutes(startedAt?: string, endedAt?: string, now = new Date()) {
  if (!startedAt) return null;
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : now.getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return Math.max(0, Math.round((end - start) / 60_000));
}

function currentTime(now: Date) {
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export function activitySegmentMinutes(segment: ActivitySegment, now = new Date()) {
  const byTimestamp = timestampMinutes(segment.startedAt, segment.endedAt, now);
  if (byTimestamp !== null) return byTimestamp;
  return spanMinutes(segment.start, segment.end || currentTime(now));
}

export function getActiveActivitySegment(record: WorkRecord) {
  return (record.activitySegments ?? []).find((segment) => segment.start && !segment.end);
}

export function closeActiveActivitySegments(
  segments: ActivitySegment[] | undefined,
  end: string,
  endedAt: string,
): ActivitySegment[] {
  return (segments ?? []).map((segment) => segment.start && !segment.end
    ? { ...segment, end, endedAt }
    : segment);
}

export function getActivityBreakdown(records: WorkRecord[], now = new Date()) {
  const totals = Object.fromEntries(activityKinds.map((kind) => [kind, 0])) as Record<ActivityKind, number>;
  for (const record of records) {
    for (const segment of record.activitySegments ?? []) {
      totals[segment.kind] += activitySegmentMinutes(segment, now);
    }
  }
  const totalMinutes = Object.values(totals).reduce((sum, value) => sum + value, 0);
  return { totals, totalMinutes };
}
