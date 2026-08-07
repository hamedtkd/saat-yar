import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");
const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string> };

function releaseSteps() {
  return pkg.scripts["check:release"].split("&&").map((step) => step.trim());
}

test("release gate keeps quality audit production and freelancer browser checks in order", () => {
  assert.deepEqual(releaseSteps(), [
    "npm run check:quality",
    "npm run check:release:audit",
    "npm run test:browser:production:built",
    "npm run test:browser:freelancer:built",
  ]);
});

test("browser release checks reuse the already-built static export", () => {
  assert.equal(pkg.scripts["test:browser:production:built"], "node scripts/production-browser-smoke.mjs");
  assert.equal(pkg.scripts["test:browser:freelancer:built"], "node --experimental-strip-types scripts/freelancer-browser-ux-smoke.mjs");
  assert.doesNotMatch(pkg.scripts["check:release"], /test:browser:production(?:\s|$)/);
  assert.doesNotMatch(pkg.scripts["check:release"], /test:browser:freelancer(?:\s|$)/);
});

test("phase 99 and phase 135 agree on the current release gate contract", () => {
  const phase99 = read("tests/phase99-release-readiness.test.ts");
  const notes = read("docs/phases/PHASE_135_NOTES_FA.md");
  const roadmap = read("docs/roadmap/BACKLOG_FA.md");
  assert.match(phase99, /test:browser:freelancer:built/);
  assert.match(notes, /AppData Schema: v17/);
  assert.match(roadmap, /\[x\] فاز ۱۳۵:/);
  assert.match(pkg.scripts.test, /phase135-release-gate-contract\.test\.ts/);
});
