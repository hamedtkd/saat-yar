import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  hasFormErrors,
  validateClientDraft,
  validateExpenseDraft,
  validateInvoiceDraft,
  validateProjectDraft,
} from "../lib/business-form-validation.ts";

const read = (path: string) => fs.readFileSync(path, "utf8");

test("business form validators expose actionable field-level feedback", () => {
  assert.equal(hasFormErrors(validateClientDraft({ name: "", email: "bad", note: "" })), true);
  assert.equal(validateClientDraft({ name: "مشتری", email: "hello@example.com", note: "" }).name, undefined);
  assert.ok(validateProjectDraft({ name: "", clientId: "", rate: -1, budgetHours: -2, note: "" }).clientId);
  assert.ok(validateExpenseDraft({ title: "", amount: 0, date: "" }).amount);
  assert.match(validateInvoiceDraft({ clientId: "c1", issuedAt: "2026-08-07", dueAt: "2026-08-01", description: "خدمات", quantity: 1, unitPrice: 1, discount: 0, taxPercent: 0 }).dueAt ?? "", /سررسید/);
});

test("client and project creation use semantic forms with inline validation", () => {
  const client = read("components/pages/clients/client-form.tsx");
  const project = read("components/pages/projects/project-form.tsx");
  for (const source of [client, project]) {
    assert.match(source, /<form onSubmit=/);
    assert.match(source, /<FormFeedback/);
    assert.match(source, /type="submit"/);
  }
  assert.match(client, /aria-invalid=/);
  assert.match(project, /validateProjectDraft/);
});

test("invoice validates required fields and due date before persistence", () => {
  const invoice = read("components/pages/invoices/form/invoice-form.tsx");
  const validator = read("lib/business-form-validation.ts");
  assert.match(invoice, /validateInvoiceDraft/);
  assert.match(invoice, /<form onSubmit=/);
  assert.match(invoice, /<FieldError message=\{errors\.dueAt\}/);
  assert.match(validator, /draft\.dueAt < draft\.issuedAt/);
});

test("manual time entry reports errors inline instead of blocking browser alerts", () => {
  const manual = read("components/pages/today/manual-entry-form.tsx");
  assert.match(manual, /<FormFeedback message=\{error\}/);
  assert.match(manual, /<form onSubmit=\{save\}/);
  assert.doesNotMatch(manual, /\balert\(/);
  assert.match(manual, /هم‌پوشانی/);
});

test("empty freelancer states offer the next useful action in context", () => {
  const clients = read("components/pages/clients/clients-table.tsx");
  const invoices = read("components/pages/invoices/table/invoices-table.tsx");
  const expenses = read("components/pages/projects/detail/expenses-panel.tsx");
  const entries = read("components/pages/projects/detail/time-entries-panel.tsx");
  assert.match(clients, /مشتری جدید/);
  assert.match(invoices, /فاکتور جدید/);
  assert.match(expenses, /ثبت اولین هزینه/);
  assert.match(entries, /شروع تایمر/);
});

test("phase 133 is documented, wired into quality, and does not invent redundant relations", () => {
  const pkg = read("package.json");
  const roadmap = read("docs/roadmap/BACKLOG_FA.md");
  const notes = read("docs/phases/PHASE_133_NOTES_FA.md");
  assert.match(pkg, /phase133-freelancer-form-ux-audit\.test\.ts/);
  assert.match(roadmap, /\[x\] فاز ۱۳۳:/);
  assert.match(notes, /Expense.*ProjectDetail/s);
  assert.match(notes, /AppData Schema: v17/);
});
