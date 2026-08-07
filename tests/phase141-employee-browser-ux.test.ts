import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildEmployeePersistenceProbeExpression } from "../scripts/employee-persistence-expression.mjs";

const read = (path: string) => readFileSync(path, "utf8");
const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
const smoke = read("scripts/employee-browser-ux-smoke.mjs");
const roadmap = read("docs/roadmap/BACKLOG_FA.md");

function compileExpression(expression: string) {
  assert.doesNotThrow(() => new Function(`return (${expression});`));
}

test("release gate runs employee browser UX after the freelancer journey without rebuilding", () => {
  const steps = pkg.scripts["check:release"].split("&&").map((step) => step.trim());
  assert.deepEqual(steps.slice(-3), [
    "npm run test:browser:production:built",
    "npm run test:browser:freelancer:built",
    "npm run test:browser:employee:built",
  ]);
  assert.equal(pkg.scripts["test:browser:employee:built"], "node --experimental-strip-types scripts/employee-browser-ux-smoke.mjs");
  assert.doesNotMatch(pkg.scripts["check:release"], /test:browser:employee(?:\s|$)/);
});

test("employee browser smoke covers attendance lunch break completion month and payroll", () => {
  for (const marker of [
    "شروع روز",
    "شروع ناهار",
    "ثبت وقفه",
    "پایان روز",
    "ویرایش این روز",
    "/month",
    "/reports",
    "فیش حقوقی تخمینی ماه",
  ]) assert.match(smoke, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(smoke, /NET_DURATION = "۸:۱۵"/);
});

test("employee persistence probe follows the snapshot envelope and exact completed-day contract", () => {
  const expression = buildEmployeePersistenceProbeExpression({ date: "2026-08-07", note: "یادداشت" });
  compileExpression(expression);
  assert.match(expression, /saatyar-app-data/);
  assert.match(expression, /stored\.data/);
  assert.match(expression, /record\?\.start === "08:00"/);
  assert.match(expression, /record\?\.end === "17:00"/);
  assert.match(expression, /lunchMinutes\) === 30/);
  assert.match(expression, /15:00/);
  assert.match(expression, /15:15/);
});

test("employee journey verifies hard reload and mobile viewport after persistence", () => {
  assert.match(smoke, /waitForEmployeePersistence/);
  assert.match(smoke, /Emulation\.setDeviceMetricsOverride/);
  assert.match(smoke, /width: 390, height: 844/);
  assert.match(smoke, /pageFits/);
  assert.match(smoke, /Hard reload restores the employee day/);
});

test("phase 141 is documented and wired without schema or dependency changes", () => {
  assert.match(pkg.scripts.test, /phase141-employee-browser-ux\.test\.ts/);
  assert.match(roadmap, /\[x\] فاز ۱۴۱:/);
  assert.match(read("docs/phases/PHASE_141_NOTES_FA.md"), /AppData Schema: v17/);
  assert.match(read("docs/phases/PHASE_141_NOTES_FA.md"), /Migration: ندارد/);
});
