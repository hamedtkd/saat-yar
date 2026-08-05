import { duration, jalali } from "@/lib/format";
import type { LeaveEntry } from "@/lib/types";

export function getLeaveTypeLabel(type: LeaveEntry["type"]) {
  if (type === "full") return "روز کامل";
  if (type === "half") return "نیم‌روز";
  return "ساعتی";
}

export function getLeaveDurationLabel(entry: LeaveEntry) {
  if (entry.type === "hourly") return duration(entry.minutes);
  if (entry.type === "half") return "نیم‌روز";
  return "یک روز";
}

export function formatLeaveDate(value: string) {
  return jalali(value, { day: "numeric", month: "long", year: "numeric" });
}
