import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");
const todayPage = read("components/pages/today/today-page.tsx");
const editor = read("components/pages/today/completed-day-editor.tsx");
const smoke = read("scripts/employee-browser-ux-smoke.mjs");
const roadmap = read("docs/roadmap/BACKLOG_FA.md");
const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string> };

test("today editor remounts when a live record becomes completed", () => {
  assert.match(todayPage, /key=\{`\$\{props\.selectedDate\}:\$\{props\.record\.start && props\.record\.end \? "completed" : "active"\}`\}/);
  assert.doesNotMatch(todayPage, /<CompletedDayEditor key=\{props\.selectedDate\}/);
});

test("completed remount starts locked and exposes explicit edit affordance", () => {
  assert.match(editor, /const completed = Boolean\(record\.start && record\.end\)/);
  assert.match(editor, /useState\(!completed\)/);
  assert.match(editor, /completed && !editing && !savedFeedback/);
  assert.match(editor, /t\("today\.edit\.start"\)/);
});

test("employee smoke waits for the completed-day edit control before clicking it", () => {
  assert.match(smoke, /completed employee day edit affordance/);
  assert.match(smoke, /querySelectorAll\("button"\)/);
  assert.match(smoke, /norm\(button\.textContent\) === "ویرایش این روز"/);
  assert.match(smoke, /clickButton\(client, "ویرایش این روز", true\)/);
});

test("phase 142 is documented and release candidate moves behind the green employee gate", () => {
  assert.match(pkg.scripts.test, /phase142-employee-completion-transition\.test\.ts/);
  assert.match(roadmap, /\[x\] فاز ۱۴۲:/);
  assert.match(roadmap, /آماده‌سازی Release Candidate نسخه 2\.3\.0/);
  assert.match(roadmap, /نهایی‌سازی Release 2\.3\.0/);
  const notes = read("docs/phases/PHASE_142_NOTES_FA.md");
  assert.match(notes, /AppData Schema: v17/);
  assert.match(notes, /Migration: ندارد/);
  assert.match(notes, /Dependency جدید: ندارد/);
});
