import type { CalendarSystem } from "./i18n/calendars.ts";
import type { Settings, TimeEntry, WorkRecord } from "./types.ts";

export const fa = new Intl.NumberFormat("fa-IR");

export const faDigits = (value: string | number) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

export function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function shiftDateKey(value: string, amount: number) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return localDateKey(date);
}

export function nowTime() {
  const date = new Date();
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function emptyRecord(date: string, settings: Settings): WorkRecord {
  return {
    date,
    start: "",
    end: "",
    lunchMinutes: settings.lunchMinutes,
    breaks: [],
    activitySegments: [],
    leaveMinutes: 0,
    leaveType: "none",
    note: "",
    holiday: false,
  };
}

export function duration(value: number, signed = false) {
  const sign = value < 0 ? "−" : signed && value > 0 ? "+" : "";
  const minutes = Math.abs(Math.round(value));
  return `${sign}${fa.format(Math.floor(minutes / 60))}:${faDigits(String(minutes % 60).padStart(2, "0"))}`;
}

export function durationSeconds(value: number) {
  const seconds = Math.max(0, Math.floor(value));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) % 60;
  const remainder = seconds % 60;
  return `${fa.format(hours)}:${faDigits(String(minutes).padStart(2, "0"))}:${faDigits(String(remainder).padStart(2, "0"))}`;
}

export function durationWords(value: number) {
  const minutes = Math.max(0, Math.round(value));
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return `${fa.format(remainder)} دقیقه`;
  if (!remainder) return `${fa.format(hours)} ساعت`;
  return `${fa.format(hours)} ساعت و ${fa.format(remainder)} دقیقه`;
}

export function money(value: number) {
  return fa.format(Math.round(value));
}

export function jalali(value: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(
    "fa-IR-u-ca-persian",
    options ?? { year: "numeric", month: "2-digit", day: "2-digit" },
  ).format(new Date(`${value}T12:00:00`));
}

export function calendarParts(date: Date, calendar: CalendarSystem = "persian") {
  if (calendar === "gregory") {
    return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
  }
  const parts = new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-latn", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return { year: read("year"), month: read("month"), day: read("day") };
}

export function jalaliParts(date: Date) {
  return calendarParts(date, "persian");
}

export function calendarMonthCells(value: string, calendar: CalendarSystem = "persian") {
  const pivot = new Date(`${value}T12:00:00`);
  const target = calendarParts(pivot, calendar);
  const first = new Date(pivot);
  while (calendarParts(first, calendar).day !== 1) first.setDate(first.getDate() - 1);
  const gridStart = new Date(first);
  gridStart.setDate(gridStart.getDate() - ((gridStart.getDay() + 1) % 7));
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(date.getDate() + index);
    const parts = calendarParts(date, calendar);
    return {
      date,
      key: localDateKey(date),
      day: parts.day,
      inMonth: parts.year === target.year && parts.month === target.month,
    };
  });
}

export function jalaliMonthCells(value: string) {
  return calendarMonthCells(value, "persian");
}

export function shiftCalendarMonth(value: string, delta: number, calendar: CalendarSystem = "persian") {
  const current = new Date(`${value}T12:00:00`);
  const currentParts = calendarParts(current, calendar);
  const cursor = new Date(current);
  do cursor.setDate(cursor.getDate() + delta); while (calendarParts(cursor, calendar).month === currentParts.month);
  while (calendarParts(cursor, calendar).day !== 1) cursor.setDate(cursor.getDate() - 1);
  return localDateKey(cursor);
}

export function shiftJalaliMonth(value: string, delta: number) {
  return shiftCalendarMonth(value, delta, "persian");
}

export function entryMinutes(entry: TimeEntry, now = Date.now()) {
  const end = entry.endedAt ? new Date(entry.endedAt).getTime() : now;
  return Math.max(0, Math.round((end - new Date(entry.startedAt).getTime()) / 60_000));
}
