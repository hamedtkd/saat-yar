import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(path, "utf8");

test("global toast uses an opaque themed surface with readable semantic tones", async () => {
  const [shell, toast] = await Promise.all([
    read("components/saatyar-shell.tsx"),
    read("components/common/app-toast.tsx"),
  ]);
  assert.match(shell, /<AppToast message=\{controller\.toast\}/);
  assert.match(toast, /data-app-toast/);
  assert.match(toast, /var\(--surface-1\)/);
  assert.match(toast, /text-\[var\(--text\)\]/);
  assert.match(toast, /success[\s\S]*warning[\s\S]*danger[\s\S]*info/);
  assert.doesNotMatch(shell, /bg-\[var\(--success-soft\)\][\s\S]*controller\.toast/);
});

test("invoice dates use the shared Jalali picker instead of browser date inputs", async () => {
  const form = await read("components/pages/invoices/form/invoice-form.tsx");
  assert.match(form, /JalaliDatePicker/);
  assert.match(form, /value=\{draft\.issuedAt\}/);
  assert.match(form, /value=\{draft\.dueAt\}/);
  assert.doesNotMatch(form, /type=["']date["']/);
});

test("project expense date uses the same Jalali picker contract", async () => {
  const form = await read("components/pages/projects/detail/expense-form.tsx");
  assert.match(form, /JalaliDatePicker/);
  assert.match(form, /value=\{draft\.date\}/);
  assert.doesNotMatch(form, /type=["']date["']/);
});

test("product UI contains no raw HTML date input after the Persian calendar pass", async () => {
  const { readdir } = await import("node:fs/promises");
  const roots = ["components", "app"];
  const sourceGroups = await Promise.all(roots.map(async (root) => {
    const entries = await readdir(root, { recursive: true });
    const sourceFiles = entries.filter((entry) => /\.(tsx?|jsx?)$/.test(entry));
    return Promise.all(sourceFiles.map((entry) => read(`${root}/${entry}`)));
  }));
  assert.doesNotMatch(sourceGroups.flat().join("\n"), /type=["']date["']/);
});

test("shared calendar renders locale-aware weekday labels and digits", async () => {
  const [grid, day, hook] = await Promise.all([
    read("components/pickers/jalali-date-picker/calendar-grid.tsx"),
    read("components/pickers/jalali-date-picker/calendar-day.tsx"),
    read("components/pickers/jalali-date-picker/use-jalali-date-picker.ts"),
  ]);
  assert.match(grid, /WEEK_DAY_KEYS/);
  assert.match(grid, /translate\(locale, key\)/);
  assert.match(day, /formatLocaleDigits\(locale, cell\.day\)/);
  assert.match(hook, /formatLocaleDate\(locale, value/);
});

test("phase 130 is documented, wired into quality, and moves relation expansion to phase 131", async () => {
  const [pkg, backlog, docs] = await Promise.all([
    read("package.json"),
    read("docs/roadmap/BACKLOG_FA.md"),
    read("docs/phases/PHASE_130_NOTES_FA.md"),
  ]);
  assert.match(pkg, /tests\/phase130-toast-jalali-date-polish\.test\.ts/);
  assert.match(backlog, /\[x\] فاز ۱۳۰:/);
  assert.match(backlog, /فاز ۱۳۱:/);
  assert.match(docs, /AppData Schema: v17/);
});
