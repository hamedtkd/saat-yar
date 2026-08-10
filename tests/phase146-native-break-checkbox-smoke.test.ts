import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("shared checkbox is a native checkbox input instead of a Radix role checkbox", async () => {
  const source = await read("components/ui/checkbox.tsx");
  assert.match(source, /<input[\s\S]*type="checkbox"/);
  assert.match(source, /onChange=\{\(event\) => onCheckedChange\?\.\(event\.target\.checked\)\}/);
  assert.doesNotMatch(source, /role="checkbox"/);
});

test("employee smoke reads the real native break checkbox contract", async () => {
  const source = await read("scripts/employee-browser-ux-smoke.mjs");
  assert.match(source, /input\[type=\\?"checkbox\\?"\]\[aria-label=\\?"وقفه 1 با حقوق\\?"\]/);
  assert.match(source, /checkbox instanceof HTMLInputElement/);
  assert.match(source, /checked: checkbox\.checked/);
  assert.match(source, /checkbox\.checked === false/);
  assert.doesNotMatch(source, /\[role=\\?"checkbox\\?"\]\[aria-label=\\?"وقفه 1 با حقوق\\?"\]/);
  assert.doesNotMatch(source, /getAttribute\("data-state"\)/);
});

test("phase 143 paid-toggle product contract remains intact while the harness follows it", async () => {
  const editor = await read("components/pages/today/time-strip/breaks-editor.tsx");
  const smoke = await read("scripts/employee-browser-ux-smoke.mjs");
  assert.match(editor, /aria-label=\{t\("today\.breaks\.paidAria", \{ count: number\(index \+ 1\) \}\)\}/);
  assert.match(editor, /checked=\{Boolean\(item\.paid\)\}/);
  assert.match(smoke, /ensureFirstBreakUnpaid/);
  assert.match(smoke, /Break paid\/unpaid native checkbox not found/);
});

test("phase 146 is wired and keeps the 2.3.0 candidate behind a green employee gate", async () => {
  const pkg = JSON.parse(await read("package.json"));
  const roadmap = await read("docs/roadmap/BACKLOG_FA.md");
  const notes = await read("docs/phases/PHASE_146_NOTES_FA.md");
  assert.match(pkg.scripts.test, /phase146-native-break-checkbox-smoke\.test\.ts/);
  assert.match(roadmap, /\[x\] فاز ۱۴۶: همگام‌سازی Employee Browser Smoke با Checkbox native/);
  assert.match(roadmap, /\[x\].*آماده‌سازی Release Candidate نسخه 2\.3\.0/);
  assert.match(roadmap, /\[x\] فاز ۱۵۳: نهایی‌سازی Release 2\.3\.0/);
  assert.match(notes, /Schema.*v17/);
  assert.match(notes, /Dependency جدید: ندارد/);
});
