import type { WorkRecord } from "./types";

export function timeToMinutes(value: string) {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return 0;
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(value: number) {
  const normalised = ((Math.round(value) % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalised / 60)).padStart(2, "0")}:${String(normalised % 60).padStart(2, "0")}`;
}

export function spanMinutes(start: string, end: string) {
  if (!start || !end) return 0;
  const startMinutes = timeToMinutes(start);
  let endMinutes = timeToMinutes(end);
  if (endMinutes < startMinutes) endMinutes += 24 * 60;
  return Math.max(0, endMinutes - startMinutes);
}

function currentTime() {
  const date = new Date();
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function calc(record: WorkRecord, dailyTarget: number) {
  const workEnd = record.end || (record.start ? currentTime() : "");
  const worked = spanMinutes(record.start, workEnd);
  const breakMinutes = record.breaks.reduce((sum, item) => {
    if (item.paid) return sum;
    return sum + spanMinutes(item.start, item.end || currentTime());
  }, 0);
  const lunchMinutes = record.lunchPaid ? 0 : record.lunchMinutes;
  const credited = Math.max(0, worked - breakMinutes - lunchMinutes + record.leaveMinutes);
  const target = record.holiday ? 0 : dailyTarget;
  const balance = credited - target;
  const plannedExit = timeToMinutes(record.start) + target + lunchMinutes + breakMinutes - record.leaveMinutes;
  return { worked, breakMinutes, credited, balance, plannedExit };
}
