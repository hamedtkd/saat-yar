import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const roots = [
  "components/pages/projects/detail",
  "components/pages/invoices/form",
  "components/pages/invoices/table",
];

function sourceFiles(root: string): string[] {
  return readdirSync(root).flatMap((name) => {
    const path = join(root, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

test("business page modules stay below 250 lines", () => {
  const oversized = roots.flatMap(sourceFiles).filter((path) => readFileSync(path, "utf8").split(/\r?\n/).length > 250);
  assert.deepEqual(oversized, []);
});

test("project detail delegates UI and mutations", () => {
  const source = readFileSync("components/pages/projects/project-detail.tsx", "utf8");
  assert.match(source, /useProjectDetail/);
  assert.match(source, /ProjectSummary/);
  assert.match(source, /ExpensesPanel/);
  assert.doesNotMatch(source, /setInterval|crypto\.randomUUID|getProjectFinanceSummary/);
});

test("invoice page delegates form, table and state", () => {
  const source = readFileSync("components/pages/invoices/invoices-page.tsx", "utf8");
  assert.match(source, /useInvoices/);
  assert.match(source, /InvoiceForm/);
  assert.match(source, /InvoicesTable/);
  assert.doesNotMatch(source, /crypto\.randomUUID|getInvoiceTotals|<table/);
});
