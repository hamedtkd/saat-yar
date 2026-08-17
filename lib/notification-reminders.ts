import type { NotificationSettings, WorkRecord } from "./types.ts";

export const BREAK_REMINDER_SNOOZE_PREFIX = "saatyar-break-reminder-snooze";
export const NOTIFICATION_SNOOZE_PREFIX = "saatyar-notification-snooze-until";

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

type TrackingRecord = Pick<
  WorkRecord,
  "start" | "end" | "startedAt" | "endedAt" | "lunchStartedAt" | "lunchEndedAt" | "breaks"
>;

export type ReminderCandidate = {
  key: string;
  kind: "open-timer" | "target" | "exit" | "break" | "custom";
  activeMinutes: number;
  customReminderId?: string;
};

export type ReminderEvaluationInput = {
  settings: NotificationSettings;
  record: TrackingRecord;
  nowMs: number;
  nowTime: string;
  fallbackWorked: number;
  dailyTarget: number;
  suggestedExit: string;
  snoozeUntilMs?: number | null;
  breakReminderSnoozed?: boolean;
};

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

function clockMinutes(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function isWithinQuietHours(now: string, start: string, end: string) {
  const nowMinutes = clockMinutes(now);
  const startMinutes = clockMinutes(start);
  const endMinutes = clockMinutes(end);
  if (nowMinutes === null || startMinutes === null || endMinutes === null || startMinutes === endMinutes) return false;
  if (startMinutes < endMinutes) return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  return nowMinutes >= startMinutes || nowMinutes < endMinutes;
}

export function notificationSnoozeKey(date: string) {
  return `${NOTIFICATION_SNOOZE_PREFIX}:${date}`;
}

export function parseNotificationSnoozeUntil(value: string | null) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function isNotificationSnoozed(untilMs: number | null | undefined, nowMs: number) {
  return typeof untilMs === "number" && Number.isFinite(untilMs) && untilMs > nowMs;
}

export function breakReminderSnoozeKey(date: string) {
  return `${BREAK_REMINDER_SNOOZE_PREFIX}:${date}`;
}

export function evaluateNotificationReminders(input: ReminderEvaluationInput): ReminderCandidate[] {
  const { settings, record, nowMs, nowTime, fallbackWorked, dailyTarget, suggestedExit } = input;
  if (!settings.enabled) return [];
  if (isNotificationSnoozed(input.snoozeUntilMs, nowMs)) return [];
  if (settings.quietHours.enabled && isWithinQuietHours(nowTime, settings.quietHours.start, settings.quietHours.end)) return [];

  const tracking = Boolean(record.start && !record.end);
  const paused = isRecordPaused(record);
  const activeMinutes = activeTrackingMinutes(record, nowMs, fallbackWorked);
  const candidates: ReminderCandidate[] = [];

  if (tracking && !paused && activeMinutes >= settings.openTimerReminderMinutes) {
    candidates.push({ key: "open-timer", kind: "open-timer", activeMinutes });
  }
  if (tracking && !paused && settings.dailyTargetReminder && dailyTarget > 0 && activeMinutes >= dailyTarget) {
    candidates.push({ key: "target", kind: "target", activeMinutes });
  }
  if (tracking && !paused && settings.endOfDayReminder && suggestedExit && nowTime >= suggestedExit) {
    candidates.push({ key: "exit", kind: "exit", activeMinutes });
  }

  const breakReminder = settings.breakReminder;
  if (tracking && !paused && breakReminder.enabled && !input.breakReminderSnoozed) {
    const interval = Math.max(15, breakReminder.intervalMinutes);
    const bucket = Math.floor(activeMinutes / interval);
    if (bucket >= 1) candidates.push({ key: `break-${bucket}`, kind: "break", activeMinutes });
  }

  if (tracking && !paused) {
    for (const custom of settings.customReminders) {
      if (!custom.enabled) continue;
      const interval = Math.max(15, custom.intervalMinutes);
      const bucket = Math.floor(activeMinutes / interval);
      if (bucket >= 1) candidates.push({
        key: `custom-${custom.id}-${bucket}`,
        kind: "custom",
        activeMinutes,
        customReminderId: custom.id,
      });
    }
  }

  return candidates;
}
