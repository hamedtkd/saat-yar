import type { WorkRecord } from "./types";

export type WorkRecordChangeKey =
  | "start"
  | "end"
  | "lunchStart"
  | "lunchEnd"
  | "lunchMinutes"
  | "lunchPaid"
  | "note"
  | "breaks";

export type WorkRecordChangeValue = string | number | boolean | undefined;

export type WorkRecordChange = {
  key: WorkRecordChangeKey;
  label: string;
  before: string;
  after: string;
  beforeValue: WorkRecordChangeValue;
  afterValue: WorkRecordChangeValue;
};

function yesNo(value: boolean | undefined) {
  return value ? "بله" : "خیر";
}

function text(value: string | number | undefined) {
  if (value === undefined || value === "") return "—";
  return String(value);
}

export function getWorkRecordChanges(before: WorkRecord, after: WorkRecord): WorkRecordChange[] {
  const fields = [
    ["start", "ورود", before.start, after.start, text(before.start), text(after.start)],
    ["end", "خروج", before.end, after.end, text(before.end), text(after.end)],
    ["lunchStart", "شروع ناهار", before.lunchStart, after.lunchStart, text(before.lunchStart), text(after.lunchStart)],
    ["lunchEnd", "پایان ناهار", before.lunchEnd, after.lunchEnd, text(before.lunchEnd), text(after.lunchEnd)],
    ["lunchMinutes", "مدت ناهار", before.lunchMinutes, after.lunchMinutes, `${before.lunchMinutes} دقیقه`, `${after.lunchMinutes} دقیقه`],
    ["lunchPaid", "ناهار باحقوق", before.lunchPaid, after.lunchPaid, yesNo(before.lunchPaid), yesNo(after.lunchPaid)],
    ["note", "یادداشت", before.note, after.note, text(before.note), text(after.note)],
    ["breaks", "تعداد وقفه‌ها", before.breaks.length, after.breaks.length, text(before.breaks.length), text(after.breaks.length)],
  ] as const;

  return fields
    .filter(([, , oldRaw, newRaw]) => oldRaw !== newRaw)
    .map(([key, label, oldRaw, newRaw, oldValue, newValue]) => ({
      key,
      label,
      before: oldValue,
      after: newValue,
      beforeValue: oldRaw,
      afterValue: newRaw,
    }));
}
