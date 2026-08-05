import { calc } from "@/lib/time-engine";
import type { Settings, WorkRecord } from "@/lib/types";
import { getDailyTargetMinutes } from "@/lib/work-schedule";
import type { MonthRecordView } from "./types";

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
