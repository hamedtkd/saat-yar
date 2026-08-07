import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildAppNavigationExpression, buildRouteReadyExpression } from "../scripts/browser-route-expression.mjs";

const read = (path: string) => readFileSync(path, "utf8");

function assertCompiles(expression: string) {
  assert.doesNotThrow(() => new Function(`return (${expression});`));
}

test("browser route expressions are syntax-safe before CDP evaluation", () => {
  for (const route of ["/clients", "/projects", "/invoices"]) {
    assertCompiles(buildAppNavigationExpression(route));
    assertCompiles(buildRouteReadyExpression(route));
  }
});

test("browser path normalization avoids regex escaping inside generated source", () => {
  const navigation = buildAppNavigationExpression("/projects");
  const ready = buildRouteReadyExpression("/projects");
  assert.match(navigation, /while \(candidate\.length > 1 && candidate\.endsWith\("\/"\)\)/);
  assert.match(ready, /candidate = candidate\.slice\(0, -1\)/);
  assert.doesNotMatch(navigation, /pathname\.replace\(/);
  assert.doesNotMatch(ready, /replace\(\/\/\+\$/);
});

test("freelancer smoke delegates route scripts to the tested builders", () => {
  const smoke = read("scripts/freelancer-browser-ux-smoke.mjs");
  assert.match(smoke, /buildAppNavigationExpression\(pathname\)/);
  assert.match(smoke, /buildRouteReadyExpression\(pathname\)/);
  assert.match(smoke, /from "\.\/browser-route-expression\.mjs"/);
});

test("phase 139 records the runtime syntax hotfix without product data changes", () => {
  const pkg = read("package.json");
  const roadmap = read("docs/roadmap/BACKLOG_FA.md");
  const notes = read("docs/phases/PHASE_139_NOTES_FA.md");
  assert.match(pkg, /phase139-browser-route-expression-syntax\.test\.ts/);
  assert.match(roadmap, /\[x\] فاز ۱۳۹:/);
  assert.match(notes, /Unexpected token 'return'/);
  assert.match(notes, /AppData Schema: v17/);
  assert.match(notes, /Dependency جدید: ندارد/);
});
