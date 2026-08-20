import { localDateKey } from "../format.ts";

export type DateTimePickerValue = {
  date: string;
  time: string;
};

export function isoToLocalDateTimeValue(isoValue: string): DateTimePickerValue {
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return { date: localDateKey(), time: "00:00" };
  return {
    date: localDateKey(date),
    time: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
  };
}

export function localDateTimeValueToIso(value: DateTimePickerValue): string {
  const [year, month, day] = value.date.split("-").map(Number);
  const [rawHour = 0, rawMinute = 0] = value.time.split(":").map(Number);
  const hour = Math.min(23, Math.max(0, Number.isFinite(rawHour) ? rawHour : 0));
  const minute = Math.min(59, Math.max(0, Number.isFinite(rawMinute) ? rawMinute : 0));
  const date = new Date(year, month - 1, day, hour, minute, 0, 0);
  return date.toISOString();
}
