import type { PayrollComponent } from "./types.ts";

export type PayrollBaseMode = "monthly-prorated" | "monthly-fixed" | "hourly" | "daily";
export type PayrollPremiumMode = "multiplier" | "fixed-hourly" | "ignore";
export type PayrollDeficitMode = "deduct" | "ignore";
export type PayrollRoundingMode = "nearest" | "floor" | "ceil";

export type PayrollRateRule = {
  mode: PayrollPremiumMode;
  multiplier: number;
  hourlyRate: number;
};

export type PayrollCalculationPolicy = {
  id: string;
  title: string;
  baseMode: PayrollBaseMode;
  baseAmount: number;
  standardDayMinutes: number;
  overtime: PayrollRateRule;
  holiday: PayrollRateRule;
  deficit: {
    mode: PayrollDeficitMode;
    multiplier: number;
  };
  rounding: {
    mode: PayrollRoundingMode;
    increment: number;
  };
};

export type PayrollFacts = {
  workedMinutes: number;
  targetMinutes: number;
  overtimeMinutes: number;
  deficitMinutes: number;
  holidayMinutes: number;
  components: PayrollComponent[];
};

export type PayrollBreakdownLine = {
  key: "base" | "overtime" | "holiday" | "earning" | "deficit" | "deduction";
  title: string;
  amount: number;
  direction: "earning" | "deduction";
};

export const DEFAULT_PAYROLL_DAY_MINUTES = 8 * 60;

function safeNumber(value: number, fallback = 0) {
  return Number.isFinite(value) ? Math.max(0, value) : fallback;
}

export function roundPayrollAmount(value: number, policy: PayrollCalculationPolicy["rounding"]) {
  const increment = Math.max(1, Math.round(safeNumber(policy.increment, 1)));
  const scaled = safeNumber(value) / increment;
  const rounded = policy.mode === "floor" ? Math.floor(scaled) : policy.mode === "ceil" ? Math.ceil(scaled) : Math.round(scaled);
  return rounded * increment;
}

export function createLegacyPayrollPolicy(input: {
  monthlySalary: number;
  overtimeMultiplier: number;
  holidayMultiplier: number;
}): PayrollCalculationPolicy {
  return {
    id: "legacy-monthly",
    title: "ماهانه بر اساس هدف کاری",
    baseMode: "monthly-prorated",
    baseAmount: safeNumber(input.monthlySalary),
    standardDayMinutes: DEFAULT_PAYROLL_DAY_MINUTES,
    overtime: { mode: "multiplier", multiplier: safeNumber(input.overtimeMultiplier, 1), hourlyRate: 0 },
    holiday: { mode: "multiplier", multiplier: safeNumber(input.holidayMultiplier, 1), hourlyRate: 0 },
    deficit: { mode: "deduct" as PayrollDeficitMode, multiplier: 1 },
    rounding: { mode: "nearest", increment: 1 },
  };
}

export function createPayrollPreset(
  preset: "monthly-prorated" | "monthly-fixed" | "hourly" | "daily",
  amount: number,
): PayrollCalculationPolicy {
  const baseAmount = safeNumber(amount);
  const common = {
    standardDayMinutes: DEFAULT_PAYROLL_DAY_MINUTES,
    overtime: { mode: "multiplier", multiplier: 1.4, hourlyRate: 0 } as PayrollRateRule,
    holiday: { mode: "multiplier", multiplier: 1.4, hourlyRate: 0 } as PayrollRateRule,
    deficit: { mode: "deduct" as PayrollDeficitMode, multiplier: 1 },
    rounding: { mode: "nearest", increment: 1 } as PayrollCalculationPolicy["rounding"],
  };

  const titles: Record<typeof preset, string> = {
    "monthly-prorated": "ماهانه بر اساس کارکرد",
    "monthly-fixed": "ماهانه ثابت",
    hourly: "ساعتی",
    daily: "روزکاری",
  };

  return { id: preset, title: titles[preset], baseMode: preset, baseAmount, ...common };
}

export function normalizePayrollPolicy(policy: PayrollCalculationPolicy): PayrollCalculationPolicy {
  const normalizeRule = (rule: PayrollRateRule): PayrollRateRule => ({
    mode: rule.mode,
    multiplier: safeNumber(rule.multiplier, 1),
    hourlyRate: safeNumber(rule.hourlyRate),
  });

  return {
    ...policy,
    title: policy.title.trim().slice(0, 80) || "روش محاسبه حقوق",
    baseAmount: safeNumber(policy.baseAmount),
    standardDayMinutes: Number.isFinite(policy.standardDayMinutes) && policy.standardDayMinutes > 0
      ? Math.max(1, Math.round(policy.standardDayMinutes))
      : DEFAULT_PAYROLL_DAY_MINUTES,
    overtime: normalizeRule(policy.overtime),
    holiday: normalizeRule(policy.holiday),
    deficit: { mode: policy.deficit.mode, multiplier: safeNumber(policy.deficit.multiplier, 1) },
    rounding: { mode: policy.rounding.mode, increment: Math.max(1, Math.round(safeNumber(policy.rounding.increment, 1))) },
  };
}

export function validatePayrollPolicy(policy: PayrollCalculationPolicy) {
  if (!policy.title.trim()) return "برای روش محاسبه حقوق یک عنوان وارد کنید.";
  if (!Number.isFinite(policy.baseAmount) || policy.baseAmount < 0) return "مبلغ پایه حقوق نامعتبر است.";
  if (!Number.isFinite(policy.standardDayMinutes) || policy.standardDayMinutes <= 0) return "ساعت استاندارد روز کاری باید بیشتر از صفر باشد.";
  if (policy.overtime.mode === "multiplier" && policy.overtime.multiplier < 0) return "ضریب اضافه‌کاری نامعتبر است.";
  if (policy.overtime.mode === "fixed-hourly" && policy.overtime.hourlyRate < 0) return "نرخ ساعتی اضافه‌کاری نامعتبر است.";
  if (policy.holiday.mode === "multiplier" && policy.holiday.multiplier < 0) return "ضریب تعطیل‌کاری نامعتبر است.";
  if (policy.holiday.mode === "fixed-hourly" && policy.holiday.hourlyRate < 0) return "نرخ ساعتی تعطیل‌کاری نامعتبر است.";
  if (policy.deficit.multiplier < 0) return "ضریب کسر کار نامعتبر است.";
  if (!Number.isFinite(policy.rounding.increment) || policy.rounding.increment <= 0) return "گام گردکردن باید بیشتر از صفر باشد.";
  return null;
}
