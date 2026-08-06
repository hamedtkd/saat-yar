import type { HolidayOverride } from "./types.ts";

export type HolidayOverrideInput = Omit<HolidayOverride, "id">;

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function isValidDateKey(value: string): boolean {
  const match = DATE_PATTERN.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

export function createHolidayOverrideInput(date: string): HolidayOverrideInput {
  return {
    date,
    title: "",
    kind: "company",
    isHoliday: true,
  };
}

export function cloneHolidayOverrides(items: HolidayOverride[]): HolidayOverride[] {
  return items.map((item) => ({ ...item }));
}

export function normalizeHolidayOverrides(items: HolidayOverride[]): HolidayOverride[] {
  return cloneHolidayOverrides(items)
    .map((item) => ({
      ...item,
      title: item.title.trim().slice(0, 100),
      multiplier: Number.isFinite(item.multiplier) && (item.multiplier ?? 0) > 0
        ? item.multiplier
        : undefined,
    }))
    .sort((left, right) => right.date.localeCompare(left.date));
}

export function validateHolidayOverrideInput(
  input: HolidayOverrideInput,
  items: HolidayOverride[],
  editingId: string | null = null,
): string | null {
  if (!isValidDateKey(input.date)) {
    return "تاریخ استثنا معتبر نیست";
  }
  if (!input.title.trim()) return "عنوان تعطیلی را وارد کنید";
  if (input.title.trim().length > 100) return "عنوان تعطیلی حداکثر می‌تواند ۱۰۰ نویسه باشد";
  if (editingId && items.some((item) => item.id !== editingId && item.date === input.date)) {
    return "برای این تاریخ قبلاً یک استثنا ثبت شده است";
  }
  return null;
}

export function upsertHolidayOverride(
  items: HolidayOverride[],
  input: HolidayOverrideInput,
  createId: () => string,
  editingId: string | null = null,
): { items: HolidayOverride[]; updated: boolean; item: HolidayOverride } {
  const normalizedInput = {
    ...input,
    title: input.title.trim().slice(0, 100),
  };
  const existing = editingId
    ? items.find((item) => item.id === editingId)
    : items.find((item) => item.date === input.date);
  const item: HolidayOverride = {
    ...normalizedInput,
    id: existing?.id ?? createId(),
  };
  const next = existing
    ? items.map((current) => current.id === existing.id ? item : { ...current })
    : [...cloneHolidayOverrides(items), item];
  return {
    items: normalizeHolidayOverrides(next),
    updated: Boolean(existing),
    item,
  };
}
