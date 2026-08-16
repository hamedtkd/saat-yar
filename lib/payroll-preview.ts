import { localDateKey } from "./format.ts";
import { calculateMonthlyPayrollForSettings, getPayrollPolicy } from "./payroll.ts";
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

  const policy = getPayrollPolicy(data.settings);
  const payroll = calculateMonthlyPayrollForSettings(data.settings, facts);
  const baseHourlyRate = payroll.baseMinuteRate * 60;
  const overtimeHourlyRate = policy.overtime.mode === "ignore"
    ? 0
    : policy.overtime.mode === "fixed-hourly"
      ? policy.overtime.hourlyRate
      : baseHourlyRate * policy.overtime.multiplier;

  return {
    source: hasCurrentMonthData ? "current-month" as const : "example" as const,
    recordCount: records.length,
    facts,
    payroll,
    rateSummary: {
      basis: policy.rateBasis,
      standardMonthMinutes: policy.standardMonthMinutes,
      baseHourlyRate: Math.round(baseHourlyRate),
      overtimeHourlyRate: Math.round(overtimeHourlyRate),
    },
  };
}
