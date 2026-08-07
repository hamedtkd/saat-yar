import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");
const smoke = read("scripts/freelancer-browser-ux-smoke.mjs");
const routeExpressions = read("scripts/browser-route-expression.mjs");

test("freelancer smoke follows real in-app links between business routes", () => {
  assert.match(smoke, /async function navigateInApp/);
  assert.match(routeExpressions, /querySelectorAll\('a\[href\]'\)/);
  assert.match(routeExpressions, /anchor\.click\(\)/);
  assert.match(smoke, /buildAppNavigationExpression\(pathname\)/);
  assert.match(smoke, /await navigateInApp\(client, "\/projects", PROJECT_NAME\)/);
  assert.match(smoke, /await navigateInApp\(client, "\/invoices", "فاکتورها"\)/);
  assert.doesNotMatch(smoke, /navigate\(client, `\$\{server\.origin\}\/projects`, PROJECT_NAME\)/);
});

test("workflow waits for IndexedDB durability before the intentional hard reload", () => {
  assert.match(smoke, /async function waitForFreelancerFlowPersistence/);
  for (const marker of ["data?.clients", "data?.projects", "data?.timeEntries", "data?.expenses", "data?.invoices"]) {
    assert.match(smoke, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  const persistence = smoke.indexOf("await waitForFreelancerFlowPersistence(client)");
  const hardReload = smoke.indexOf('await navigate(client, `${server.origin}/invoices`, CLIENT_NAME)');
  assert.ok(persistence >= 0 && hardReload > persistence, "hard reload must happen only after persisted workflow data is observed");
});

test("browser journey now separates SPA navigation fidelity from reload durability", () => {
  assert.match(smoke, /in-app navigation \$\{pathname\}/);
  assert.match(smoke, /Freelancer workflow is durable in IndexedDB before hard reload/);
  assert.match(smoke, /await navigate\(client, `\$\{server\.origin\}\/invoices`, CLIENT_NAME\)/);
});

test("phase 137 is documented and wired without schema or dependency changes", () => {
  const pkg = read("package.json");
  const roadmap = read("docs/roadmap/BACKLOG_FA.md");
  const notes = read("docs/phases/PHASE_137_NOTES_FA.md");
  assert.match(pkg, /phase137-freelancer-navigation-persistence\.test\.ts/);
  assert.match(roadmap, /\[x\] فاز ۱۳۷:/);
  assert.match(notes, /AppData Schema: v17/);
  assert.match(notes, /Dependency جدید: ندارد/);
});
