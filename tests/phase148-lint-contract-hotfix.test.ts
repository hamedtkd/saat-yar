import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("time strip action hook owns only the updateRecord dependency it uses", async () => {
  const actions = await read("components/pages/today/time-strip/use-time-strip-actions.ts");
  assert.match(actions, /type ActionProps = Pick<TodayTimeStripProps, "updateRecord">/);
  assert.match(actions, /useTimeStripActions\(\{ updateRecord \}: ActionProps\)/);
  assert.doesNotMatch(actions, /\{ record, updateRecord \}/);
});

test("advanced editor passes the minimal action-hook contract while retaining record for editors", async () => {
  const editor = await read("components/pages/today/time-strip/advanced-editor.tsx");
  assert.match(editor, /useTimeStripActions\(\{ updateRecord: props\.updateRecord \}\)/);
  assert.match(editor, /LunchEditor record=\{props\.record\}/);
  assert.match(editor, /BreaksEditor record=\{props\.record\}/);
});

test("phase 148 closes the lint-only regression before the 2.3.0 candidate", async () => {
  const pkg = JSON.parse(await read("package.json"));
  const roadmap = await read("docs/roadmap/BACKLOG_FA.md");
  const notes = await read("docs/phases/PHASE_148_NOTES_FA.md");
  assert.match(pkg.scripts.test, /phase148-lint-contract-hotfix\.test\.ts/);
  assert.match(roadmap, /\[x\] فاز ۱۴۸:/);
  assert.match(roadmap, /\[x\] فاز [۰-۹]+: آماده‌سازی Release Candidate نسخه 2\.3\.0/);
  assert.match(roadmap, /\[x\] فاز ۱۵۳: نهایی‌سازی Release 2\.3\.0/);
  assert.match(notes, /Schema.*v17/);
  assert.match(notes, /Dependency جدید: ندارد/);
});
