import { getPayrollBaseMinuteRate } from "./payroll-engine.ts";
import { getPayrollPolicy } from "./payroll.ts";
import { calc } from "./time-engine.ts";
import { getDailyTargetMinutes } from "./work-schedule.ts";
import type { PayrollCalculationPolicy, PayrollFacts, PayrollRateRule } from "./payroll-policy.ts";
import type { Settings, WorkRecord } from "./types.ts";

export type PayrollPeriodFacts = Omit<PayrollFacts, "components"> & {
  actualWorkedMinutes: number;
  creditedMinutes: number;
  regularBalanceMinutes: number;
};

export type PayrollRateSummary = {
  baseHourlyRate: number;
  overtimeHourlyRate: number;
  holidayHourlyRate: number;
  deficitHourlyRate: number;
};

function premiumHourlyRate(rule: PayrollRateRule, baseHourlyRate: number) {
  if (rule.mode === "ignore") return 0;
  if (rule.mode === "fixed-hourly") return Math.max(0, rule.hourlyRate);
  return baseHourlyRate * Math.max(0, rule.multiplier);
}

export function derivePayrollPeriodFacts(records: WorkRecord[], settings: Settings): PayrollPeriodFacts {
  let actualWorkedMinutes = 0;
  let creditedMinutes = 0;
  let targetMinutes = 0;
  let holidayMinutes = 0;
  let regularBalanceMinutes = 0;

  for (const record of records) {
    const dailyTarget = getDailyTargetMinutes(record.date, settings);
    const result = calc(record, dailyTarget);
    const holidayWork = record.holiday ? result.worked : 0;
    const regularCredit = record.holiday ? result.worked : result.credited;

    actualWorkedMinutes += result.worked;
    creditedMinutes += regularCredit;
    targetMinutes += result.target;
    holidayMinutes += holidayWork;
    if (!record.holiday) regularBalanceMinutes += result.credited - result.target;
  }

  return {
    actualWorkedMinutes,
    creditedMinutes,
    workedMinutes: creditedMinutes,
    targetMinutes,
    overtimeMinutes: Math.max(0, regularBalanceMinutes),
    deficitMinutes: Math.max(0, -regularBalanceMinutes),
    holidayMinutes,
    regularBalanceMinutes,
  };
}

export function getPayrollRateSummary(
  policy: PayrollCalculationPolicy,
  facts: Pick<PayrollFacts, "targetMinutes">,
): PayrollRateSummary {
  const baseHourlyRate = getPayrollBaseMinuteRate(policy, facts) * 60;
  return {
    baseHourlyRate,
    overtimeHourlyRate: premiumHourlyRate(policy.overtime, baseHourlyRate),
    holidayHourlyRate: premiumHourlyRate(policy.holiday, baseHourlyRate),
    deficitHourlyRate: policy.deficit.mode === "ignore" ? 0 : baseHourlyRate * Math.max(0, policy.deficit.multiplier),
  };
}

export function getPayrollRateSummaryForSettings(settings: Settings, facts: Pick<PayrollFacts, "targetMinutes">) {
  return getPayrollRateSummary(getPayrollPolicy(settings), facts);
}
