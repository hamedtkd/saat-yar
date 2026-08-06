import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  calculatePayrollComponentTotals,
  clonePayrollComponents,
  createPayrollComponent,
  normalizePayrollComponents,
  validatePayrollComponents,
} from "../lib/payroll-components.ts";
import type { PayrollComponent } from "../lib/types.ts";

const fixture = (overrides: Partial<PayrollComponent> = {}): PayrollComponent => ({
  id: "payroll-1",
  title: "حق مسکن",
  amount: 1_000_000,
  type: "earning",
  enabled: true,
  ...overrides,
});

test("payroll drafts clone and normalize independently before persistence", () => {
  const source = [fixture({ title: "  حق مسکن  ", amount: 1250.6 })];
  const cloned = clonePayrollComponents(source);
  cloned[0].title = "ویرایش محلی";
  assert.equal(source[0].title, "  حق مسکن  ");

  const normalized = normalizePayrollComponents(source);
  assert.equal(normalized[0].title, "حق مسکن");
  assert.equal(normalized[0].amount, 1251);
  assert.equal(normalized[0].enabled, true);
});

test("payroll validation reports empty titles and negative amounts", () => {
  assert.match(validatePayrollComponents([fixture({ title: "" })]) ?? "", /عنوان ردیف/);
  assert.match(validatePayrollComponents([fixture({ amount: -1 })]) ?? "", /مبلغ ردیف/);
  assert.equal(validatePayrollComponents([fixture()]), null);
});

test("payroll totals ignore disabled rows and separate earnings from deductions", () => {
  const totals = calculatePayrollComponentTotals([
    fixture({ amount: 100, type: "earning" }),
    fixture({ id: "payroll-2", amount: 30, type: "deduction" }),
    fixture({ id: "payroll-3", amount: 500, enabled: false }),
  ]);
  assert.deepEqual(totals, { earnings: 100, deductions: 30 });
});

test("new payroll rows start with a safe editable contract", () => {
  assert.deepEqual(createPayrollComponent("new-id"), {
    id: "new-id",
    title: "مزایای جدید",
    amount: 0,
    type: "earning",
    enabled: true,
  });
});

test("payroll settings use the shared draft and destructive confirmation contracts", async () => {
  const source = await readFile("components/pages/settings/payroll-settings-card.tsx", "utf8");
  assert.match(source, /useSettingsDraft/);
  assert.match(source, /EditableCardActions/);
  assert.match(source, /prepare: normalizePayrollComponents/);
  assert.match(source, /fieldset disabled=\{!editor\.editing\}/);
  assert.match(source, /AlertDialogTitle>این آیتم حقوقی حذف شود/);
  assert.match(source, /آیتم از پیش‌نویس حذف شد/);
  assert.doesNotMatch(source, /function updateItems/);
});
