import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildEmployeeBreakPersistenceProbeExpression } from "../scripts/employee-persistence-expression.mjs";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("employee controlled text input uses the proven InputEvent contract", async () => {
  const smoke = await read("scripts/employee-browser-ux-smoke.mjs");
  assert.match(smoke, /new InputEvent\("input", \{ bubbles: true, inputType: "insertText", data:/);
  assert.doesNotMatch(smoke, /dispatchEvent\(new Event\("input", \{ bubbles: true \}\)\)/);
});

test("pre-clockout employee persistence probe compiles and checks exact break state", () => {
  const expression = buildEmployeeBreakPersistenceProbeExpression({ date: "2026-08-08" });
  assert.doesNotThrow(() => new Function(`return ${expression};`));
  assert.match(expression, /breakStart/);
  assert.match(expression, /breakEnd/);
  assert.match(expression, /breakUnpaid/);
  assert.match(expression, /15:00/);
  assert.match(expression, /15:15/);
});

test("employee browser journey proves edited break persistence before clock-out and full persistence before net UI", async () => {
  const smoke = await read("scripts/employee-browser-ux-smoke.mjs");
  const breakProbeIndex = smoke.indexOf("waitForEmployeeBreakPersistence(client, date)");
  const clockOutIndex = smoke.indexOf('clickButton(client, "پایان روز", true)');
  const completedProbeIndex = smoke.indexOf("waitForEmployeePersistence(client, date)");
  const netUiIndex = smoke.indexOf('"employee net duration"');
  assert.ok(breakProbeIndex > -1 && clockOutIndex > -1 && breakProbeIndex < clockOutIndex);
  assert.ok(completedProbeIndex > -1 && netUiIndex > -1 && completedProbeIndex < netUiIndex);
});

test("phase 149 remains a gate-hardening phase and keeps the 2.3.0 candidate behind a green employee journey", async () => {
  const pkg = JSON.parse(await read("package.json"));
  const roadmap = await read("docs/roadmap/BACKLOG_FA.md");
  const notes = await read("docs/phases/PHASE_149_NOTES_FA.md");
  assert.match(pkg.scripts.test, /phase149-employee-input-persistence-fidelity\.test\.ts/);
  assert.match(roadmap, /\[x\] فاز ۱۴۹:/);
  assert.match(roadmap, /\[ \] فاز ۱۵۰: آماده‌سازی Release Candidate نسخه 2\.3\.0/);
  assert.match(roadmap, /\[ \] فاز ۱۵۱: نهایی‌سازی Release 2\.3\.0/);
  assert.match(notes, /Schema.*v17/);
  assert.match(notes, /Dependency جدید: ندارد/);
});
