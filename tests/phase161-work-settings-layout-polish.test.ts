import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("work schedule overview uses a balanced responsive three-card grid", async () => {
  const editor = await read("components/pages/settings/work-schedule-editor.tsx");
  assert.match(editor, /md:grid-cols-2/);
  assert.match(editor, /xl:grid-cols-\[1\.15fr_1fr_1fr\]/);
  assert.match(editor, /md:col-span-2 xl:col-span-1/);
  assert.equal((editor.match(/min-h-\[148px\]/g) ?? []).length, 3);
});

test("lunch defaults separate duration and paid-state controls cleanly", async () => {
  const editor = await read("components/pages/settings/work-schedule-editor.tsx");
  assert.match(editor, /مدت ناهار/);
  assert.match(editor, /نحوه محاسبه/);
  assert.match(editor, /justify-between gap-2/);
  assert.doesNotMatch(editor, /min-w-\[250px\]/);
});

test("weekly net target keeps the field and unit on one aligned row", async () => {
  const editor = await read("components/pages/settings/work-schedule-editor.tsx");
  assert.match(editor, /grid-cols-\[minmax\(0,1fr\)_auto\] items-center gap-2/);
  assert.match(editor, />ساعت<\/span>/);
  assert.doesNotMatch(editor, /min-w-\[190px\]/);
});

test("phase 161 documents visual-only settings polish without changing the lunch contract", async () => {
  const [notes, changelog, backlog] = await Promise.all([
    read("docs/phases/PHASE_161_NOTES_FA.md"),
    read("CHANGELOG.md"),
    read("docs/roadmap/BACKLOG_FA.md"),
  ]);
  assert.match(notes, /بدون تغییر منطق محاسبه/);
  assert.match(notes, /Phase 160/);
  assert.match(changelog, /چیدمان بالای برنامه کاری/);
  assert.match(backlog, /فاز ۱۶۱/);
});
