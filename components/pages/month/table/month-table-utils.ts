import { calc } from "@/lib/time-engine";
import type { Settings, WorkRecord } from "@/lib/types";
import { getDailyTargetMinutes } from "@/lib/work-schedule";
import type { MonthRecordView, MonthTableSort } from "./types";

export function toMonthRecordView(
  item: WorkRecord,
  settings: Settings,
): MonthRecordView {
  const result = calc(item, getDailyTargetMinutes(item.date, settings));

  return {
    item,
    worked: result.worked,
    totalRest: result.breakMinutes + item.lunchMinutes,
    balance: result.balance,
  };
}

function timeSortValue(value?: string) {
  if (!value) return -1;
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return -1;
  return hours * 60 + minutes;
}

export function sortMonthRecords(records: WorkRecord[], settings: Settings, sort: MonthTableSort) {
  const factor = sort.direction === "asc" ? 1 : -1;
  return [...records].sort((left, right) => {
    if (sort.key === "date") return left.date.localeCompare(right.date) * factor;
    if (sort.key === "clockIn" || sort.key === "clockOut") {
      const leftTime = timeSortValue(sort.key === "clockIn" ? left.start : left.end);
      const rightTime = timeSortValue(sort.key === "clockIn" ? right.start : right.end);
      if (leftTime < 0 && rightTime >= 0) return 1;
      if (rightTime < 0 && leftTime >= 0) return -1;
      return (leftTime - rightTime) * factor || left.date.localeCompare(right.date) * -1;
    }

    const leftView = toMonthRecordView(left, settings);
    const rightView = toMonthRecordView(right, settings);
    const leftValue = sort.key === "worked" ? leftView.worked : sort.key === "rest" ? leftView.totalRest : leftView.balance;
    const rightValue = sort.key === "worked" ? rightView.worked : sort.key === "rest" ? rightView.totalRest : rightView.balance;
    return (leftValue - rightValue) * factor || left.date.localeCompare(right.date) * -1;
  });
}
