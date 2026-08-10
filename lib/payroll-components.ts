import { translateSystem } from "./i18n/system.ts";
import type { Locale } from "./i18n/locales.ts";
import type { PayrollComponent } from "./types.ts";

export const MAX_PAYROLL_COMPONENT_TITLE_LENGTH = 80;

export function createPayrollComponent(id: string, locale: Locale = "fa-IR"): PayrollComponent {
  return {
    id,
    title: translateSystem(locale, "New benefit"),
    amount: 0,
    type: "earning",
    enabled: true,
  };
}

export function clonePayrollComponents(items: PayrollComponent[]) {
  return items.map((item) => ({ ...item }));
}

export function normalizePayrollComponents(items: PayrollComponent[], locale: Locale = "fa-IR") {
  return items.map((item) => ({
    ...item,
    title: item.title.trim().slice(0, MAX_PAYROLL_COMPONENT_TITLE_LENGTH) || translateSystem(locale, "Payroll item"),
    amount: Number.isFinite(item.amount) ? Math.max(0, Math.round(item.amount)) : 0,
    enabled: item.enabled !== false,
  }));
}

export function validatePayrollComponents(items: PayrollComponent[], locale: Locale = "fa-IR") {
  const invalidTitleIndex = items.findIndex((item) => !item.title.trim());
  if (invalidTitleIndex >= 0) return translateSystem(locale, "Enter a title for row {row}.", { row: new Intl.NumberFormat(locale === "fa-IR" ? "fa-IR" : "en-US").format(invalidTitleIndex + 1) });

  const longTitleIndex = items.findIndex((item) => item.title.trim().length > MAX_PAYROLL_COMPONENT_TITLE_LENGTH);
  if (longTitleIndex >= 0) return translateSystem(locale, "The title in row {row} is too long.", { row: new Intl.NumberFormat(locale === "fa-IR" ? "fa-IR" : "en-US").format(longTitleIndex + 1) });

  const invalidAmountIndex = items.findIndex((item) => !Number.isFinite(item.amount) || item.amount < 0);
  if (invalidAmountIndex >= 0) return translateSystem(locale, "Amount in row {row} must be zero or greater.", { row: new Intl.NumberFormat(locale === "fa-IR" ? "fa-IR" : "en-US").format(invalidAmountIndex + 1) });

  return null;
}

export function calculatePayrollComponentTotals(items: PayrollComponent[]) {
  return items.reduce((totals, item) => {
    if (item.enabled === false) return totals;
    if (item.type === "earning") totals.earnings += item.amount;
    else totals.deductions += item.amount;
    return totals;
  }, { earnings: 0, deductions: 0 });
}
