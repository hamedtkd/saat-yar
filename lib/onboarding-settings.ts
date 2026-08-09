import { clonePayrollPolicy } from "./payroll-policy.ts";
import type { Settings, ThemeMode, ThemePreset } from "./types.ts";
import { themePresets } from "./theme.ts";

export function updateOnboardingSalary(settings: Settings, salary: number): Settings {
  const amount = Number.isFinite(salary) ? Math.max(0, Math.round(salary)) : 0;
  const payrollPolicy = clonePayrollPolicy(settings.payrollPolicy);
  if (payrollPolicy.baseMode.startsWith("monthly-")) payrollPolicy.baseAmount = amount;

  return {
    ...settings,
    salary: amount,
    payrollPolicy,
  };
}

export function updateOnboardingOvertimeMultiplier(settings: Settings, multiplier: number): Settings {
  const value = Number.isFinite(multiplier) ? Math.max(0, multiplier) : settings.overtimeMultiplier;
  const payrollPolicy = clonePayrollPolicy(settings.payrollPolicy);
  if (payrollPolicy.overtime.mode === "multiplier") payrollPolicy.overtime.multiplier = value;
  return { ...settings, overtimeMultiplier: value, payrollPolicy };
}

export function updateOnboardingHolidayMultiplier(settings: Settings, multiplier: number): Settings {
  const value = Number.isFinite(multiplier) ? Math.max(0, multiplier) : settings.holidayMultiplier;
  const payrollPolicy = clonePayrollPolicy(settings.payrollPolicy);
  if (payrollPolicy.holiday.mode === "multiplier") payrollPolicy.holiday.multiplier = value;
  return { ...settings, holidayMultiplier: value, payrollPolicy };
}

export function updateOnboardingAppearance(
  settings: Settings,
  patch: { mode?: ThemeMode; preset?: Exclude<ThemePreset, "custom"> },
): Settings {
  const appearance = { ...settings.appearance };
  if (patch.mode) appearance.mode = patch.mode;
  if (patch.preset) {
    appearance.preset = patch.preset;
    appearance.accent = themePresets[patch.preset];
  }
  return { ...settings, appearance };
}
