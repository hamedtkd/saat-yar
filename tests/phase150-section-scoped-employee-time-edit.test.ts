import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("employee section time edits anchor to the exact heading owner", async () => {
  const smoke = await read("scripts/employee-browser-ux-smoke.mjs");
  assert.match(smoke, /const heading = \[\.\.\.document\.querySelectorAll\("strong"\)\]\.find\(\(item\) => norm\(item\.textContent\) === \$\{JSON\.stringify\(sectionTitle\)\}\);/);
  assert.match(smoke, /const section = heading\?\.closest\("section"\) \|\| null;/);
  assert.doesNotMatch(smoke, /querySelectorAll\("section"\)\]\s*\.find\(\(node\) => \[\.\.\.node\.querySelectorAll\("strong"\)\]/);
});

test("break editor assertion reads the break section instead of a parent attendance section", async () => {
  const smoke = await read("scripts/employee-browser-ux-smoke.mjs");
  const start = smoke.indexOf("async function assertFirstBreakEditorContract");
  const end = smoke.indexOf("async function ensureFirstBreakUnpaid", start);
  const block = smoke.slice(start, end);
  assert.match(block, /norm\(item\.textContent\) === "وقفه‌ها"/);
  assert.match(block, /heading\?\.closest\("section"\)/);
  assert.match(block, /section\.querySelector\('input\[type="checkbox"\]\[aria-label="وقفه 1 با حقوق"\]'\)/);
});

test("phase 149 IndexedDB evidence remains the authority for lunch and break separation", async () => {
  const smoke = await read("scripts/employee-browser-ux-smoke.mjs");
  const persistence = await read("scripts/employee-persistence-expression.mjs");
  assert.match(smoke, /waitForEmployeeBreakPersistence\(client, date\)/);
  assert.match(persistence, /lunchStart/);
  assert.match(persistence, /breakStart/);
  assert.match(persistence, /breakEnd/);
  assert.match(persistence, /breakUnpaid/);
});

test("phase 150 records the selector-scope hotfix while release candidate stays behind a green employee gate", async () => {
  const pkg = JSON.parse(await read("package.json"));
  const roadmap = await read("docs/roadmap/BACKLOG_FA.md");
  const notes = await read("docs/phases/PHASE_150_NOTES_FA.md");
  assert.match(pkg.scripts.test, /phase150-section-scoped-employee-time-edit\.test\.ts/);
  assert.match(roadmap, /\[x\] فاز ۱۵۰:/);
  assert.match(roadmap, /\[x\] فاز [۰-۹]+: آماده‌سازی Release Candidate نسخه 2\.3\.0/);
  assert.match(roadmap, /\[x\] فاز ۱۵۳: نهایی‌سازی Release 2\.3\.0/);
  assert.match(notes, /closest\("section"\)/);
  assert.match(notes, /Schema.*v17/);
  assert.match(notes, /Dependency جدید: ندارد/);
});
