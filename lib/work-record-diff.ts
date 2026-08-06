import type { WorkRecord } from "./types";

export type WorkRecordChange = {
  key: string;
  label: string;
  before: string;
  after: string;
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
    ["start", "ورود", text(before.start), text(after.start)],
    ["end", "خروج", text(before.end), text(after.end)],
    ["lunchStart", "شروع ناهار", text(before.lunchStart), text(after.lunchStart)],
    ["lunchEnd", "پایان ناهار", text(before.lunchEnd), text(after.lunchEnd)],
    ["lunchMinutes", "مدت ناهار", `${before.lunchMinutes} دقیقه`, `${after.lunchMinutes} دقیقه`],
    ["lunchPaid", "ناهار باحقوق", yesNo(before.lunchPaid), yesNo(after.lunchPaid)],
    ["note", "یادداشت", text(before.note), text(after.note)],
    ["breaks", "تعداد وقفه‌ها", text(before.breaks.length), text(after.breaks.length)],
  ] as const;

  return fields
    .filter(([, , oldValue, newValue]) => oldValue !== newValue)
    .map(([key, label, oldValue, newValue]) => ({ key, label, before: oldValue, after: newValue }));
}
