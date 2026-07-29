import type { AppData } from "./types";

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function isValidAppData(value: unknown): value is AppData {
  if (!isObject(value)) return false;
  const source = "settings" in value && "records" in value ? value : (value.data as unknown);
  if (!isObject(source)) return false;
  return (
    isObject(source.settings) &&
    isObject(source.records) &&
    Array.isArray(source.leaves) &&
    Array.isArray(source.clients) &&
    Array.isArray(source.projects) &&
    Array.isArray(source.timeEntries)
  );
}

export function parseBackup(value: unknown): AppData {
  if (!isObject(value)) throw new Error("ساختار فایل معتبر نیست");
  const candidate = "data" in value ? value.data : value;
  if (!isValidAppData(candidate)) throw new Error("ساختار فایل معتبر نیست");
  return candidate;
}
