import type { BreakItem, WorkRecord } from "./types.ts";
import { spanMinutes } from "./time-engine.ts";

export type RecordIssueCode =
  | "missing-start"
  | "missing-end"
  | "invalid-work-span"
  | "partial-lunch"
  | "open-break"
  | "invalid-lunch"
  | "invalid-break"
  | "leave-without-type";

export type RecordIssue = {
  code: RecordIssueCode;
  message: string;
  severity: "warning" | "error";
};

function isPartial(start?: string, end?: string) {
  return Boolean(start) !== Boolean(end);
}

function invalidSpan(start?: string, end?: string) {
  if (!start || !end) return false;
  return spanMinutes(start, end) <= 0;
}

export function getRecordIssues(record: WorkRecord): RecordIssue[] {
  const issues: RecordIssue[] = [];
  const hasActivity = Boolean(
    record.start ||
      record.end ||
      record.lunchStart ||
      record.lunchEnd ||
      record.breaks.length ||
      record.leaveMinutes ||
      record.note.trim(),
  );

  if (hasActivity && !record.start && record.leaveType !== "full") {
    issues.push({ code: "missing-start", message: "ساعت ورود ثبت نشده است.", severity: "error" });
  }

  if (record.start && !record.end) {
    issues.push({ code: "missing-end", message: "ساعت خروج هنوز ثبت نشده است.", severity: "warning" });
  }

  if (record.start && record.end && invalidSpan(record.start, record.end)) {
    issues.push({ code: "invalid-work-span", message: "ساعت خروج باید بعد از ساعت ورود باشد.", severity: "error" });
  }

  if (isPartial(record.lunchStart, record.lunchEnd)) {
    issues.push({ code: "partial-lunch", message: "شروع یا پایان ناهار ناقص است.", severity: "error" });
  }

  if (invalidSpan(record.lunchStart, record.lunchEnd)) {
    issues.push({ code: "invalid-lunch", message: "بازه ناهار معتبر نیست.", severity: "error" });
  }

  record.breaks.forEach((item, index) => {
    if (item.start && !item.end) {
      issues.push({ code: "open-break", message: `وقفه شماره ${index + 1} هنوز پایان نیافته است.`, severity: "warning" });
    } else if (isPartial(item.start, item.end) || invalidSpan(item.start, item.end)) {
      issues.push({ code: "invalid-break", message: `بازه وقفه شماره ${index + 1} معتبر نیست.`, severity: "error" });
    }
  });

  if (record.leaveMinutes > 0 && record.leaveType === "none") {
    issues.push({ code: "leave-without-type", message: "برای مرخصی ثبت‌شده نوع مرخصی انتخاب نشده است.", severity: "error" });
  }

  return issues;
}

export function getRecordStatus(record: WorkRecord) {
  const issues = getRecordIssues(record);
  if (!record.start && !record.end && !record.leaveMinutes && !record.note.trim() && record.breaks.length === 0) {
    return { state: "empty" as const, label: "بدون رکورد", issues };
  }
  if (issues.some((item) => item.severity === "error")) {
    return { state: "invalid" as const, label: "نیازمند اصلاح", issues };
  }
  if (issues.length > 0) {
    return { state: "incomplete" as const, label: "ناقص", issues };
  }
  return { state: "complete" as const, label: "کامل", issues };
}

export function closeOpenBreaks(breaks: BreakItem[], end: string) {
  return breaks.map((item) => item.start && !item.end ? { ...item, end, endedAt: undefined } : item);
}
