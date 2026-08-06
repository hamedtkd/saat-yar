import type { PayrollComponent } from "./types.ts";

export const MAX_PAYROLL_COMPONENT_TITLE_LENGTH = 80;

export function createPayrollComponent(id: string): PayrollComponent {
  return {
    id,
    title: "مزایای جدید",
    amount: 0,
    type: "earning",
    enabled: true,
  };
}

export function clonePayrollComponents(items: PayrollComponent[]) {
  return items.map((item) => ({ ...item }));
}

export function normalizePayrollComponents(items: PayrollComponent[]) {
  return items.map((item) => ({
    ...item,
    title: item.title.trim().slice(0, MAX_PAYROLL_COMPONENT_TITLE_LENGTH) || "آیتم حقوقی",
    amount: Number.isFinite(item.amount) ? Math.max(0, Math.round(item.amount)) : 0,
    enabled: item.enabled !== false,
  }));
}

export function validatePayrollComponents(items: PayrollComponent[]) {
  const invalidTitleIndex = items.findIndex((item) => !item.title.trim());
  if (invalidTitleIndex >= 0) return `عنوان ردیف ${(invalidTitleIndex + 1).toLocaleString("fa-IR")} را وارد کنید.`;

  const longTitleIndex = items.findIndex((item) => item.title.trim().length > MAX_PAYROLL_COMPONENT_TITLE_LENGTH);
  if (longTitleIndex >= 0) return `عنوان ردیف ${(longTitleIndex + 1).toLocaleString("fa-IR")} بیش از حد طولانی است.`;

  const invalidAmountIndex = items.findIndex((item) => !Number.isFinite(item.amount) || item.amount < 0);
  if (invalidAmountIndex >= 0) return `مبلغ ردیف ${(invalidAmountIndex + 1).toLocaleString("fa-IR")} باید صفر یا بیشتر باشد.`;

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
