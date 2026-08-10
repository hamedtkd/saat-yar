import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFile(new URL(path, root), "utf8");

test("completed-day edit actions dock above mobile navigation and stay sticky on desktop", async () => {
  const bar = await read("components/pages/today/completed-day-edit-action-bar.tsx");
  const editor = await read("components/pages/today/completed-day-editor.tsx");
  assert.match(bar, /data-completed-edit-actions/);
  assert.match(bar, /fixed bottom-\[calc\(82px\+env\(safe-area-inset-bottom\)\)\]/);
  assert.match(bar, /xl:sticky/);
  assert.match(bar, /xl:top-\[78px\]/);
  assert.match(bar, /xl:bottom-auto/);
  assert.match(editor, /pb-\[calc\(136px\+env\(safe-area-inset-bottom\)\)\] xl:pb-0/);
  assert.match(bar, /aria-label=\{t\("today\.edit\.controlsAria"\)\}/);
});

test("completed-day edit bar exposes dirty state and explicit draft actions", async () => {
  const bar = await read("components/pages/today/completed-day-edit-action-bar.tsx");
  assert.match(bar, /data-dirty=\{dirty \? "true" : "false"\}/);
  assert.match(bar, /t\("today\.edit\.unsavedCount"/);
  assert.match(bar, /t\("today\.edit\.noChanges"\)/);
  assert.match(bar, /t\("common\.cancel"\)/);
  assert.match(bar, /t\("common\.reset"\)/);
  assert.match(bar, /t\("common\.saveChanges"\)/);
  assert.match(bar, /disabled=\{!dirty\}/);
});

test("save feedback replaces the visible edit bar before fading", async () => {
  const editor = await read("components/pages/today/completed-day-editor.tsx");
  const bar = await read("components/pages/today/completed-day-edit-action-bar.tsx");
  assert.match(editor, /const \[savedFeedback, setSavedFeedback\] = useState\(false\)/);
  assert.match(editor, /setSavedFeedback\(true\)/);
  assert.match(editor, /window\.setTimeout\(\(\) => \{/);
  assert.match(editor, /3200/);
  assert.match(editor, /<CompletedDayEditSavedNotice \/>/);
  assert.match(bar, /data-completed-edit-feedback/);
  assert.match(bar, /role="status"/);
  assert.match(bar, /t\("today\.edit\.saved"\)/);
});

test("completed-day fields expose a clear locked versus editing contract", async () => {
  const editor = await read("components/pages/today/completed-day-editor.tsx");
  assert.match(editor, /data-completed-day-editor/);
  assert.match(editor, /data-editing=\{completed && editing \? "true" : "false"\}/);
  assert.match(editor, /data-completed-edit-fields=\{completed \? \(editing \? "active" : "locked"\) : "live"\}/);
  assert.match(editor, /completed && editing && "\[&_input\]:border-/);
  assert.match(editor, /locked && "disabled:\[&_input\]:opacity-75/);
});

test("employee browser smoke proves desktop edit actions remain visible after scrolling", async () => {
  const smoke = await read("scripts/employee-browser-ux-smoke.mjs");
  assert.match(smoke, /scrollCompletedAdvancedEditorIntoView/);
  assert.match(smoke, /desktop completed-day edit action bar/);
  assert.match(smoke, /Completed-day edit actions stay visible beside the editor after scrolling/);
  assert.match(smoke, /completed-day save feedback/);
  assert.match(smoke, /Completed-day save confirms success inside the current viewport/);
});

test("employee browser smoke proves mobile edit actions are fixed above bottom navigation", async () => {
  const smoke = await read("scripts/employee-browser-ux-smoke.mjs");
  assert.match(smoke, /nav\[aria-label="ناوبری موبایل"\]/);
  assert.match(smoke, /getComputedStyle\(bar\)\.position === "fixed"/);
  assert.match(smoke, /clearOfMobileNav/);
  assert.match(smoke, /mobile completed-day edit action bar/);
  assert.match(smoke, /Mobile completed-day edit actions remain visible without colliding with bottom navigation/);
  assert.match(smoke, /clickButton\(client, "انصراف", true\)/);
});

test("Phase 170 is documented and wired into the main quality command", async () => {
  const pkg = JSON.parse(await read("package.json")) as { scripts: Record<string, string> };
  const roadmap = await read("docs/roadmap/BACKLOG_FA.md");
  const docs = await read("docs/README.md");
  const notes = await read("docs/phases/PHASE_170_NOTES_FA.md");
  assert.match(pkg.scripts.test, /phase170-completed-day-edit-feedback\.test\.ts/);
  assert.match(roadmap, /\[x\] فاز ۱۷۰:/);
  assert.match(docs, /PHASE_170_NOTES_FA\.md/);
  assert.match(notes, /AppData Schema: v17/);
  assert.match(notes, /Migration: ندارد/);
  assert.match(notes, /Dependency جدید: ندارد/);
});
