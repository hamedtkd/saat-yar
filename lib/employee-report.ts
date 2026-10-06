import { calculateEmployeeDayPayForSettings } from "./payroll.ts";
import { calc } from "./time-engine.ts";
import { getDailyTargetMinutes } from "./work-schedule.ts";
import type { Settings, WorkRecord } from "./types.ts";

export function getEmployeeDayPay({ record, settings, dailyTarget = getDailyTargetMinutes(record.date, settings) }: { record: WorkRecord; settings: Settings; dailyTarget?: number }) {
  const result = calc(record, dailyTarget);
  return calculateEmployeeDayPayForSettings({ settings, creditedMinutes: result.credited, dailyTargetMinutes: dailyTarget, holiday: record.holiday });
}
