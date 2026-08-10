import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path: string) => fs.readFileSync(path, "utf8");

test("toast tones stay semantic without fixed white or black text", () => {
  const toast = read("components/common/app-toast.tsx");
  assert.doesNotMatch(toast, /\btext-(?:white|black)\b/);
  assert.match(toast, /text-\[var\(--success\)\]/);
  assert.match(toast, /text-\[var\(--danger\)\]/);
});

test("invoice form can create and auto-select both clients and projects", () => {
  const form = read("components/pages/invoices/form/invoice-form.tsx");
  const route = read("app/invoices/page.tsx");
  assert.match(form, /QuickClientDialog/);
  assert.match(form, /QuickProjectDialog/);
  assert.match(form, /onCreated=\{selectClient\}/);
  assert.match(form, /onCreated=\{selectProject\}/);
  assert.match(route, /createClient=\{controller\.createClient\}/);
  assert.match(route, /createProject=\{controller\.createProject\}/);
});

test("live timer supports inline client and project creation without guessing the first project", () => {
  const relation = read("components/pages/today/timer-relation-fields.tsx");
  const focus = read("components/pages/today/today-focus-card.tsx");
  assert.match(relation, /QuickClientDialog/);
  assert.match(relation, /QuickProjectDialog/);
  assert.match(relation, /project\.clientId === selectedClientId/);
  assert.doesNotMatch(focus, /find\(\(project\) => project\.clientId === clientId\)\?\.id/);
});

test("manual time entry follows the same related entity creation path", () => {
  const manual = read("components/pages/today/manual-entry-form.tsx");
  assert.match(manual, /QuickClientDialog/);
  assert.match(manual, /QuickProjectDialog/);
  assert.match(manual, /onCreated=\{selectProject\}/);
});

test("quick project dialog can return the created project to its owning form", () => {
  const dialog = read("components/pages/projects/quick-project-dialog.tsx");
  assert.match(dialog, /onCreated\?: \(id: string\) => void/);
  assert.match(dialog, /onCreated\?\.\(id\)/);
  assert.match(dialog, /b\("common\.saveAndSelect"\)/);
});

test("phase 131 is wired into quality and roadmap documents contextual expenses", () => {
  const pkg = read("package.json");
  const roadmap = read("docs/roadmap/BACKLOG_FA.md");
  assert.match(pkg, /phase131-related-entity-expansion\.test\.ts/);
  assert.match(roadmap, /فاز ۱۳۱/);
  assert.match(roadmap, /Expense/);
});
