import { localDateKey } from "./format.ts";
import { calculateMonthlyPayrollForSettings } from "./payroll.ts";
import { calc } from "./time-engine.ts";
import { getDailyTargetMinutes } from "./work-schedule.ts";
import type { AppData } from "./types.ts";

export function createPayrollPreview(data: AppData, now = new Date()) {
  const month = localDateKey(now).slice(0, 7);
  const records = Object.values(data.records).filter((record) => record.date.startsWith(month));
  let workedMinutes = 0;
  let targetMinutes = 0;
  let holidayMinutes = 0;
  let balance = 0;

  for (const record of records) {
    const target = getDailyTargetMinutes(record.date, data.settings);
    const result = calc(record, target);
    workedMinutes += result.worked;
    targetMinutes += record.holiday ? 0 : target;
    holidayMinutes += record.holiday ? result.worked : 0;
    balance += result.balance;
  }

  const hasCurrentMonthData = records.length > 0;
  const facts = hasCurrentMonthData
    ? {
        workedMinutes, targetMinutes, holidayMinutes,
        deficitMinutes: Math.max(0, -balance),
        overtimeMinutes: Math.max(0, Math.max(0, balance) - holidayMinutes),
      }
    : {
        workedMinutes: 168 * 60, targetMinutes: 160 * 60, holidayMinutes: 8 * 60,
        deficitMinutes: 0, overtimeMinutes: 8 * 60,
      };

  return {
    source: hasCurrentMonthData ? "current-month" as const : "example" as const,
    recordCount: records.length,
    facts,
    payroll: calculateMonthlyPayrollForSettings(data.settings, facts),
  };
}
