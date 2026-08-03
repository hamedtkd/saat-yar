import { fa } from "@/lib/format";
import { timeToMinutes } from "@/lib/time-engine";
import type { Settings } from "@/lib/types";

export const WEEKDAY_LABELS = [
  "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه",
  "پنجشنبه", "جمعه", "شنبه",
];

export const CHART_COLORS = {
  worked: "#079b60",
  target: "#3478e5",
  overtime: "#079b60",
  deficit: "#e54845",
  time: "#079b60",
  income: "#3478e5",
  billable: "#079b60",
  nonBillable: "#f1c65f",
};

export function localDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function parseLocalDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? new Date(value) : date;
}

export function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function compactMoney(value: number) {
  const absoluteValue = Math.abs(value);
  if (absoluteValue >= 1_000_000_000) return `${fa.format(Math.round(value / 1_000_000_000))} میلیارد`;
  if (absoluteValue >= 1_000_000) return `${fa.format(Math.round(value / 1_000_000))} میلیون`;
  if (absoluteValue >= 1_000) return `${fa.format(Math.round(value / 1_000))} هزار`;
  return fa.format(Math.round(value));
}

export function getDailyTarget(settings: Settings) {
  return Math.max(
    1,
    timeToMinutes(settings.defaultEnd) -
      timeToMinutes(settings.defaultStart) -
      settings.lunchMinutes,
  );
}
