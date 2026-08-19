import { spanMinutes } from "./time-engine.ts";
import type { ActivityKind, ActivitySegment, WorkRecord } from "./types.ts";

export const ACTIVITY_TITLE_MAX_LENGTH = 120;

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

export function normalizeActivityTitle(value?: string) {
  const title = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  return title ? title.slice(0, ACTIVITY_TITLE_MAX_LENGTH) : undefined;
}

export function getRecentActivityTitleSuggestions(records: WorkRecord[], limit = 6) {
  const seen = new Set<string>();
  const suggestions: string[] = [];
  const orderedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date));
  for (const record of orderedRecords) {
    for (const segment of [...(record.activitySegments ?? [])].reverse()) {
      const title = normalizeActivityTitle(segment.title);
      if (!title) continue;
      const key = title.toLocaleLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      suggestions.push(title);
      if (suggestions.length >= limit) return suggestions;
    }
  }
  return suggestions;
}


export function createActivitySegment({
  id,
  kind,
  title,
  projectId,
  workProjectId,
  start,
  startedAt,
}: {
  id: string;
  kind: ActivityKind;
  title?: string;
  projectId?: string;
  workProjectId?: string;
  start: string;
  startedAt: string;
}): ActivitySegment {
  return {
    id,
    kind,
    title: normalizeActivityTitle(title),
    projectId: projectId || undefined,
    workProjectId: workProjectId || undefined,
    start,
    end: "",
    startedAt,
  };
}

export function activitySegmentMinutes(segment: ActivitySegment, now = new Date()) {
  const byTimestamp = timestampMinutes(segment.startedAt, segment.endedAt, now);
  if (byTimestamp !== null) return byTimestamp;
  return spanMinutes(segment.start, segment.end || currentTime(now));
}


export function activitySegmentElapsedSeconds(segment: ActivitySegment, now = new Date()) {
  if (segment.startedAt) {
    const start = new Date(segment.startedAt).getTime();
    const end = segment.endedAt ? new Date(segment.endedAt).getTime() : now.getTime();
    if (Number.isFinite(start) && Number.isFinite(end)) return Math.max(0, Math.floor((end - start) / 1_000));
  }
  const minutes = spanMinutes(segment.start, segment.end || currentTime(now));
  return Math.max(0, minutes * 60 + (segment.end ? 0 : now.getSeconds()));
}

export function updateCompletedActivitySegmentDuration(
  segments: ActivitySegment[] | undefined,
  segmentId: string,
  minutes: number,
): ActivitySegment[] {
  const safeMinutes = Math.max(1, Math.min(24 * 60, Math.round(minutes)));
  return (segments ?? []).map((segment) => {
    if (segment.id !== segmentId || !segment.end) return segment;
    const end = (() => {
      const startMinutes = Number(segment.start.slice(0, 2)) * 60 + Number(segment.start.slice(3, 5));
      const next = ((startMinutes + safeMinutes) % (24 * 60) + 24 * 60) % (24 * 60);
      return `${String(Math.floor(next / 60)).padStart(2, "0")}:${String(next % 60).padStart(2, "0")}`;
    })();
    const startedAtMs = segment.startedAt ? new Date(segment.startedAt).getTime() : Number.NaN;
    return {
      ...segment,
      end,
      endedAt: Number.isFinite(startedAtMs)
        ? new Date(startedAtMs + safeMinutes * 60_000).toISOString()
        : undefined,
    };
  });
}

export function removeCompletedActivitySegment(segments: ActivitySegment[] | undefined, segmentId: string) {
  return (segments ?? []).filter((segment) => segment.id !== segmentId || !segment.end);
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
