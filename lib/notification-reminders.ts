import type { WorkRecord } from "./types.ts";

export const BREAK_REMINDER_SNOOZE_PREFIX = "saatyar-break-reminder-snooze";

function timestamp(value?: string) {
  if (!value) return null;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

function overlapMinutes(start: number | null, end: number | null, rangeStart: number, rangeEnd: number) {
  if (start === null) return 0;
  const boundedStart = Math.max(start, rangeStart);
  const boundedEnd = Math.min(end ?? rangeEnd, rangeEnd);
  return Math.max(0, Math.floor((boundedEnd - boundedStart) / 60_000));
}

type TrackingRecord = Pick<WorkRecord, "startedAt" | "endedAt" | "lunchStartedAt" | "lunchEndedAt" | "breaks">;

export function activeTrackingMinutes(record: TrackingRecord, nowMs: number, fallbackWorked: number) {
  const startedAt = timestamp(record.startedAt);
  if (startedAt === null) return Math.max(0, fallbackWorked);

  const endedAt = timestamp(record.endedAt) ?? nowMs;
  const rangeEnd = Math.max(startedAt, Math.min(nowMs, endedAt));
  const elapsed = Math.floor((rangeEnd - startedAt) / 60_000);

  const lunch = overlapMinutes(
    timestamp(record.lunchStartedAt),
    timestamp(record.lunchEndedAt),
    startedAt,
    rangeEnd,
  );
  const breaks = record.breaks.reduce(
    (total, item) => total + overlapMinutes(
      timestamp(item.startedAt),
      timestamp(item.endedAt),
      startedAt,
      rangeEnd,
    ),
    0,
  );

  return Math.max(0, elapsed - lunch - breaks);
}

export function isRecordPaused(record: Pick<WorkRecord, "lunchStartedAt" | "lunchEndedAt" | "breaks">) {
  const lunchOpen = Boolean(record.lunchStartedAt && !record.lunchEndedAt);
  const breakOpen = record.breaks.some((item) => item.startedAt && !item.endedAt);
  return lunchOpen || breakOpen;
}

export function breakReminderSnoozeKey(date: string) {
  return `${BREAK_REMINDER_SNOOZE_PREFIX}:${date}`;
}
