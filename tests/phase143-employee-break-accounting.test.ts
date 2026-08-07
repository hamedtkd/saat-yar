import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { calc } from "../lib/time-engine.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("08:00-17:00 minus 30m lunch and 15m unpaid break is 8:15", () => {
  const result = calc({
    date: "2026-08-07", start: "08:00", end: "17:00", lunchMinutes: 30, lunchPaid: false,
    breaks: [{ id: "break-1", start: "15:00", end: "15:15", title: "وقفه شخصی", paid: false }],
    leaveMinutes: 0, leaveType: "none", note: "", holiday: false, manuallyEdited: true,
  }, 0);
  assert.equal(result.grossMinutes, 540);
  assert.equal(result.unpaidLunchMinutes, 30);
  assert.equal(result.unpaidBreakMinutes, 15);
  assert.equal(result.worked, 495);
});

test("attendance patches merge into the latest stored record instead of a stale render snapshot", async () => {
  const source = await read("hooks/controller/use-attendance-actions.ts");
  assert.match(source, /const current = previous\.records\[selectedDate\] \?\? record/);
  assert.match(source, /\.\.\.current,\s*\.\.\.patch/);
  assert.doesNotMatch(source, /saveRecord\(\{ \.\.\.record, \.\.\.patch/);
});

test("break editor exposes an explicit paid toggle for every break", async () => {
  const source = await read("components/pages/today/time-strip/breaks-editor.tsx");
  assert.match(source, /<Checkbox/);
  assert.match(source, /checked=\{Boolean\(item\.paid\)\}/);
  assert.match(source, /updateBreak\(item\.id, \{ paid \}\)/);
  assert.match(source, /با حقوق/);
});

test("employee browser journey pins the created break to the unpaid contract", async () => {
  const source = await read("scripts/employee-browser-ux-smoke.mjs");
  assert.match(source, /ensureFirstBreakUnpaid/);
  assert.match(source, /وقفه 1 با حقوق/);
  assert.match(source, /NET_DURATION = "۸:۱۵"/);
});

test("phase 143 stays in quality and keeps 2.3.0 candidate behind the green employee gate", async () => {
  const pkg = JSON.parse(await read("package.json"));
  const roadmap = await read("docs/roadmap/BACKLOG_FA.md");
  const notes = await read("docs/phases/PHASE_143_NOTES_FA.md");
  assert.match(pkg.scripts.test, /phase143-employee-break-accounting\.test\.ts/);
  assert.match(roadmap, /\[x\] فاز ۱۴۳/);
  assert.match(roadmap, /\[ \] فاز ۱۴۵: آماده‌سازی Release Candidate نسخه 2\.3\.0/);
  assert.match(notes, /۸:۱۵/);
});
