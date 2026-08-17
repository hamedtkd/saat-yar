import { localDateKey } from "./format.ts";
import { calculateMonthlyPayrollForSettings, getPayrollPolicy } from "./payroll.ts";
import { derivePayrollPeriodFacts, getPayrollRateSummary } from "./payroll-period.ts";
import type { AppData } from "./types.ts";

export function createPayrollPreview(data: AppData, now = new Date()) {
  const month = localDateKey(now).slice(0, 7);
  const records = Object.values(data.records).filter((record) => record.date.startsWith(month));
  const hasCurrentMonthData = records.length > 0;
  const derived = derivePayrollPeriodFacts(records, data.settings);
  const facts = hasCurrentMonthData
    ? {
        workedMinutes: derived.workedMinutes,
        targetMinutes: derived.targetMinutes,
        holidayMinutes: derived.holidayMinutes,
        deficitMinutes: derived.deficitMinutes,
        overtimeMinutes: derived.overtimeMinutes,
      }
    : {
        workedMinutes: 168 * 60, targetMinutes: 160 * 60, holidayMinutes: 8 * 60,
        deficitMinutes: 0, overtimeMinutes: 8 * 60,
      };

  const policy = getPayrollPolicy(data.settings);
  const payroll = calculateMonthlyPayrollForSettings(data.settings, facts);
  const rates = getPayrollRateSummary(policy, facts);

  return {
    source: hasCurrentMonthData ? "current-month" as const : "example" as const,
    recordCount: records.length,
    facts,
    payroll,
    rateSummary: {
      basis: policy.rateBasis,
      standardMonthMinutes: policy.standardMonthMinutes,
      baseHourlyRate: Math.round(rates.baseHourlyRate),
      overtimeHourlyRate: Math.round(rates.overtimeHourlyRate),
      holidayHourlyRate: Math.round(rates.holidayHourlyRate),
      deficitHourlyRate: Math.round(rates.deficitHourlyRate),
    },
  };
}
