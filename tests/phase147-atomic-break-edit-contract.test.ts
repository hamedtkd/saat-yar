import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("work-record updates accept functional patches against the latest record", async () => {
  const types = await read("lib/types.ts");
  const attendance = await read("hooks/controller/use-attendance-actions.ts");
  assert.match(types, /WorkRecordPatch = Partial<WorkRecord> \| \(\(current: WorkRecord\) => Partial<WorkRecord>\)/);
  assert.match(attendance, /typeof patch === "function" \? patch\(current\) : patch/);
});

test("nested lunch and break edits are derived from the latest record instead of render snapshots", async () => {
  const actions = await read("components/pages/today/time-strip/use-time-strip-actions.ts");
  assert.match(actions, /updateRecord\(\(current\) => \(\{/);
  assert.match(actions, /breaks: current\.breaks\.map/);
  assert.match(actions, /breaks: \[\.\.\.current\.breaks/);
  assert.match(actions, /current\.breaks\.filter/);
  assert.doesNotMatch(actions, /breaks: record\.breaks\.map/);
});

test("employee browser journey verifies the edited break contract before clock-out and persistence keeps it unpaid", async () => {
  const smoke = await read("scripts/employee-browser-ux-smoke.mjs");
  const persistence = await read("scripts/employee-persistence-expression.mjs");
  assert.match(smoke, /assertFirstBreakEditorContract/);
  assert.match(smoke, /start !== "15:00"/);
  assert.match(smoke, /end !== "15:15"/);
  assert.match(smoke, /paid !== false/);
  assert.match(persistence, /item\?\.paid === false/);
  assert.match(persistence, /breaks: Array\.isArray\(record\.breaks\)/);
});

test("phase 147 closes break edit atomicity before the 2.3.0 release candidate", async () => {
  const pkg = JSON.parse(await read("package.json"));
  const roadmap = await read("docs/roadmap/BACKLOG_FA.md");
  const notes = await read("docs/phases/PHASE_147_NOTES_FA.md");
  assert.match(pkg.scripts.test, /phase147-atomic-break-edit-contract\.test\.ts/);
  assert.match(roadmap, /\[x\] فاز ۱۴۷:/);
  assert.match(roadmap, /\[ \] فاز ۱۴۸: آماده‌سازی Release Candidate نسخه 2\.3\.0/);
  assert.match(roadmap, /\[ \] فاز ۱۴۹: نهایی‌سازی Release 2\.3\.0/);
  assert.match(notes, /Schema.*v17/);
  assert.match(notes, /Dependency جدید: ندارد/);
});
