import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import {
  enBusinessCatalog,
  faBusinessCatalog,
  translateBusiness,
} from "../lib/i18n/business.ts";
import {
  validateClientDraft,
  validateExpenseDraft,
  validateInvoiceDraft,
  validateProjectDraft,
} from "../lib/business-form-validation.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

async function readSourceTree(root: string) {
  const entries = await readdir(new URL(`../${root}`, import.meta.url), { recursive: true });
  const files = entries.filter((entry) => /\.(ts|tsx)$/.test(entry));
  return Promise.all(files.map(async (entry) => ({ path: `${root}/${entry}`, source: await read(`${root}/${entry}`) })));
}

test("business catalogs keep exact bilingual key parity and parameter interpolation", () => {
  const faKeys = Object.keys(faBusinessCatalog).sort();
  const enKeys = Object.keys(enBusinessCatalog).sort();
  assert.deepEqual(enKeys, faKeys);
  assert.equal(translateBusiness("fa-IR", "clients.title"), "مشتری‌ها");
  assert.equal(translateBusiness("en", "clients.title"), "Clients");
  assert.equal(translateBusiness("en", "projects.quick.title", { client: "Acme" }), "New project for Acme");
  assert.equal(translateBusiness("fa-IR", "leave.table.count", { count: 3 }), "3 مورد");
});

test("business validators preserve Persian defaults and expose English field feedback", () => {
  assert.match(validateClientDraft({ name: "", email: "bad", note: "" }).name ?? "", /نام مشتری/);
  assert.equal(validateClientDraft({ name: "", email: "", note: "" }, "en").name, "Enter a client name.");
  assert.equal(validateProjectDraft({ name: "", clientId: "", rate: -1, budgetHours: -1, note: "" }, "en").clientId, "Select a client or create one here.");
  assert.equal(validateExpenseDraft({ title: "", amount: 0, date: "" }, "en").amount, "Expense amount must be greater than zero.");
  assert.equal(validateInvoiceDraft({ clientId: "c1", issuedAt: "2026-08-10", dueAt: "2026-08-09", description: "Service", quantity: 1, unitPrice: 1, discount: 0, taxPercent: 0 }, "en").dueAt, "Due date cannot be before the issue date.");
});

test("business page source trees consume locale UI instead of Persian interface literals", async () => {
  const roots = ["components/pages/clients", "components/pages/projects", "components/pages/invoices", "components/pages/leave"];
  const trees = (await Promise.all(roots.map(readSourceTree))).flat();
  const joined = trees.map((item) => item.source).join("\n");
  assert.match(joined, /useBusinessUi/);
  assert.match(joined, /clients\.overview\.title/);
  assert.match(joined, /projects\.section\.title/);
  assert.match(joined, /invoices\.section\.title/);
  assert.match(joined, /leave\.overview\.title/);
  assert.doesNotMatch(joined, /[\u0600-\u06FF]/);
});

test("expense categories and invoice statuses keep domain values separate from translated labels", async () => {
  const [expenseConstants, invoiceTypes] = await Promise.all([
    read("components/pages/projects/detail/constants.ts"),
    read("components/pages/invoices/types.ts"),
  ]);
  assert.match(expenseConstants, /messageKey: "expenses\.category\.software"/);
  assert.match(expenseConstants, /value: "software"/);
  assert.match(invoiceTypes, /draft: "invoices\.status\.draft"/);
  assert.match(invoiceTypes, /paid: "invoices\.status\.paid"/);
  assert.doesNotMatch(`${expenseConstants}\n${invoiceTypes}`, /[\u0600-\u06FF]/);
});

test("business actions derive toasts and workspace mode copy from the active locale", async () => {
  const actions = await read("hooks/controller/use-business-actions.ts");
  assert.match(actions, /getBrowserLocale\(\)/);
  assert.match(actions, /translateBusiness\(getBrowserLocale\(\), "toast\.clientSaved"\)/);
  assert.match(actions, /translateBusiness\(getBrowserLocale\(\), "toast\.projectSaved"\)/);
  assert.match(actions, /translateBusiness\(getBrowserLocale\(\), leaveDraft\.id \? "toast\.leaveEdited" : "toast\.leaveSaved"\)/);
  assert.match(actions, /translateBusiness\(locale, "toast\.workspaceMode"/);
  assert.doesNotMatch(actions, /[\u0600-\u06FF]/);
});

test("business locale facade remains memoized across ordinary rerenders", async () => {
  const source = await read("components/i18n/use-business-ui.ts");
  assert.match(source, /import \{ useMemo \} from "react"/);
  assert.match(source, /const ui = useLocaleUi\(\)/);
  assert.match(source, /return useMemo\(\(\) => \(\{/);
  assert.match(source, /\}\), \[ui\]\);/);
});

test("business layouts use locale-aware formatting and logical positioning", async () => {
  const [clientTable, projectTime, invoiceRow, leaveForm, leaveUtils] = await Promise.all([
    read("components/pages/clients/clients-table.tsx"),
    read("components/pages/projects/detail/time-entries-panel.tsx"),
    read("components/pages/invoices/table/invoice-row.tsx"),
    read("components/pages/leave/leave-form.tsx"),
    read("components/pages/leave/table/leave-table-utils.ts"),
  ]);
  assert.match(clientTable, /date\(/);
  assert.match(projectTime, /date\(startedAt/);
  assert.match(invoiceRow, /date\(invoice\.issuedAt\)/);
  assert.match(leaveUtils, /CalendarSystem/);
  assert.match(leaveUtils, /formatLocaleDate\(locale, value,[\s\S]*calendar\)/);
  assert.match(leaveForm, /absolute top-1\/2 end-3/);
});

test("CSV and Excel report exports localize headers dates booleans filenames and toast copy", async () => {
  const source = await read("hooks/controller/use-report-actions.ts");
  assert.match(source, /getBrowserLocale\(\)/);
  assert.match(source, /calendar: CalendarSystem/);
  assert.match(source, /formatLocaleDate\(locale,[\s\S]*calendar\)/);
  assert.match(source, /reports\.export\.freelancer\.client/);
  assert.match(source, /reports\.export\.employee\.holiday/);
  assert.match(source, /reports\.export\.downloaded/);
  assert.doesNotMatch(source, /[\u0600-\u06FF]/);
  assert.equal(translateBusiness("en", "invoices.printAria"), "Print invoice");
});

test("production browser smoke covers English business routes before Persian restore", async () => {
  const smoke = await read("scripts/production-browser-smoke.mjs");
  assert.match(smoke, /English Clients business surface/);
  assert.match(smoke, /English Projects business surface/);
  assert.match(smoke, /English Invoices business surface/);
  assert.match(smoke, /English Leave business surface/);
  assert.match(smoke, /Clients, Projects, Invoices, and Leave render localized English LTR business surfaces/);
  assert.match(smoke, /Persian RTL locale restore/);
});

test("freelancer browser journey proves English validation then restores Persian historical flow", async () => {
  const smoke = await read("scripts/freelancer-browser-ux-smoke.mjs");
  assert.match(smoke, /localStorage\.setItem\("saatyar-locale-v1", "en"\)/);
  assert.match(smoke, /English client validation/);
  assert.match(smoke, /Enter a client name/);
  assert.match(smoke, /Freelancer business surface and validation follow English LTR locale/);
  assert.match(smoke, /localStorage\.setItem\("saatyar-locale-v1", "fa-IR"\)/);
  assert.match(smoke, /Persian freelancer locale restore/);
  assert.match(smoke, /مشتری مرورگر/);
});

test("Phase 176 is documented and wired without schema dependency or release version changes", async () => {
  const [pkgSource, notes, backlog, docs, schema] = await Promise.all([
    read("package.json"),
    read("docs/phases/PHASE_176_NOTES_FA.md"),
    read("docs/roadmap/BACKLOG_FA.md"),
    read("docs/README.md"),
    read("lib/data/version.ts"),
  ]);
  const pkg = JSON.parse(pkgSource) as { version: string; dependencies: Record<string, string>; devDependencies: Record<string, string>; scripts: Record<string, string> };
  assert.match(pkg.scripts.test, /phase176-i18n-business-pages\.test\.ts/);
  assert.match(notes, /Package: `2\.3\.2`/);
  assert.match(notes, /AppData Schema: `v17`/);
  assert.match(notes, /Migration: ندارد/);
  assert.match(notes, /Dependency جدید: ندارد/);
  assert.match(backlog, /\[x\] فاز ۱۷۶:/);
  assert.match(backlog, /\[x\] فاز ۱۷۷:/);
  assert.match(backlog, /\[x\] فاز ۱۷۸:/);
  assert.match(docs, /PHASE_176_NOTES_FA\.md/);
  assert.match(schema, /APP_DATA_SCHEMA_VERSION = 17/);
});
