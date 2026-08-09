import type { BreakItem, WorkRecord } from "./types.ts";

export function timeToMinutes(value: string) {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return 0;
  const [hours, minutes] = value.split(":").map(Number);
  if (hours > 23 || minutes > 59) return 0;
  return hours * 60 + minutes;
}

export function minutesToTime(value: number) {
  const normalised = ((Math.round(value) % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalised / 60)).padStart(2, "0")}:${String(normalised % 60).padStart(2, "0")}`;
}

export function addMinutesToTime(value: string, minutes: number) {
  return minutesToTime(timeToMinutes(value) + minutes);
}

export function spanMinutes(start: string, end: string) {
  if (!start || !end) return 0;
  const startMinutes = timeToMinutes(start);
  let endMinutes = timeToMinutes(end);
  if (endMinutes < startMinutes) endMinutes += 24 * 60;
  return Math.max(0, endMinutes - startMinutes);
}

function currentTime(now: Date) {
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function timestampDurationSeconds(startedAt: string | undefined, endedAt: string | undefined, now: Date) {
  if (!startedAt) return null;
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : now.getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return Math.max(0, Math.floor((end - start) / 1_000));
}

function timestampDuration(startedAt: string | undefined, endedAt: string | undefined, now: Date) {
  const seconds = timestampDurationSeconds(startedAt, endedAt, now);
  return seconds === null ? null : Math.round(seconds / 60);
}

function breakDuration(item: BreakItem, now: Date) {
  const byTimestamp = timestampDuration(item.startedAt, item.endedAt, now);
  if (byTimestamp !== null) return byTimestamp;
  return spanMinutes(item.start, item.end || currentTime(now));
}

function liveClockSpanSeconds(start: string, end: string, now: Date, running: boolean) {
  const base = spanMinutes(start, end) * 60;
  return running ? base + now.getSeconds() : base;
}

function breakDurationSeconds(item: BreakItem, now: Date) {
  const byTimestamp = timestampDurationSeconds(item.startedAt, item.endedAt, now);
  if (byTimestamp !== null) return byTimestamp;
  return liveClockSpanSeconds(item.start, item.end || currentTime(now), now, !item.end);
}

export function liveWorkedSeconds(record: WorkRecord, now = new Date()) {
  const grossByTimestamp = record.manuallyEdited
    ? null
    : timestampDurationSeconds(record.startedAt, record.endedAt, now);
  const grossSeconds = !record.start
    ? 0
    : grossByTimestamp !== null
      ? grossByTimestamp
      : liveClockSpanSeconds(record.start, record.end || currentTime(now), now, !record.end);
  const unpaidBreakSeconds = record.breaks.reduce(
    (sum, item) => sum + (item.paid ? 0 : breakDurationSeconds(item, now)),
    0,
  );
  const lunchByTimestamp = record.lunchStartedAt
    ? timestampDurationSeconds(record.lunchStartedAt, record.lunchEndedAt, now)
    : null;
  const unpaidLunchSeconds = record.lunchPaid || !record.lunchStart
    ? 0
    : lunchByTimestamp !== null
      ? lunchByTimestamp
      : liveClockSpanSeconds(record.lunchStart, record.lunchEnd || currentTime(now), now, !record.lunchEnd);
  return Math.max(0, grossSeconds - unpaidBreakSeconds - unpaidLunchSeconds);
}

export function calc(record: WorkRecord, dailyTarget: number, now = new Date()) {
  const grossByTimestamp = record.manuallyEdited
    ? null
    : timestampDuration(record.startedAt, record.endedAt, now);
  const grossMinutes = !record.start
    ? 0
    : grossByTimestamp !== null
      ? grossByTimestamp
      : spanMinutes(record.start, record.end || currentTime(now));

  const breakMinutes = record.breaks.reduce((sum, item) => sum + breakDuration(item, now), 0);
  const unpaidBreakMinutes = record.breaks.reduce(
    (sum, item) => sum + (item.paid ? 0 : breakDuration(item, now)),
    0,
  );
  const unpaidLunchMinutes = record.lunchPaid ? 0 : Math.max(0, record.lunchMinutes);
  const worked = Math.max(0, grossMinutes - unpaidBreakMinutes - unpaidLunchMinutes);
  const leave = record.leaveType === "full" ? dailyTarget : Math.max(0, record.leaveMinutes);
  const credited = worked + leave;
  const target = record.holiday ? 0 : dailyTarget;
  const balance = credited - target;
  const plannedExit = record.start
    ? timeToMinutes(record.start) + target + unpaidLunchMinutes + unpaidBreakMinutes - leave
    : 0;

  return {
    grossMinutes,
    breakMinutes,
    unpaidBreakMinutes,
    unpaidLunchMinutes,
    worked,
    leave,
    credited,
    target,
    balance,
    plannedExit,
  };
}

export function calcLive(record: WorkRecord, dailyTarget: number, now = new Date()) {
  const result = calc(record, dailyTarget, now);
  if (!record.start || record.end) return result;
  const worked = Math.max(0, Math.floor(liveWorkedSeconds(record, now) / 60));
  const credited = worked + result.leave;
  return { ...result, worked, credited, balance: credited - result.target };
}
