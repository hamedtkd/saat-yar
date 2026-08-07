import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";
import { collectReleaseAuditFailures } from "../scripts/release-audit.mjs";

const read = (path: string) => readFileSync(path, "utf8");
const packageJson = JSON.parse(read("package.json")) as {
  version: string;
  engines: { node: string };
  scripts: Record<string, string>;
};
const packageLock = JSON.parse(read("package-lock.json")) as {
  version: string;
  packages: Record<string, { version?: string }>;
};
const manifest = JSON.parse(read("docs/releases/2.3.0.json")) as Record<string, unknown> & {
  version: string;
  releaseDate: string;
  status: string;
  dataSchemaVersion: number;
  nodeEngine: string;
  verifiedCandidateCommitPrefix: string;
  verifiedCandidateTestCount: number;
  expectedFinalTestCount: number;
  browserGate: string;
  freelancerBrowserGate: string;
  employeeBrowserGate: string;
  pairingBrowserGate: string;
  pairingCommand: string;
  releaseNotes: { fa: string; en: string };
  tag: string;
};

const requiredMedia = [
  "docs/assets/screenshots/today-light-desktop.png",
  "docs/assets/screenshots/today-dark-desktop.png",
  "docs/assets/screenshots/today-mobile.png",
  "docs/assets/screenshots/reports-light.png",
  "docs/assets/screenshots/reports-dark.png",
  "docs/assets/media/onboarding.gif",
];

test("2.3.0 candidate version Node schema and tag remain valid after finalization", () => {
  assert.equal(packageJson.version, "2.3.0");
  assert.equal(packageLock.version, "2.3.0");
  assert.equal(packageLock.packages[""]?.version, "2.3.0");
  assert.equal(manifest.version, "2.3.0");
  assert.equal(manifest.releaseDate, "2026-08-08");
  assert.equal(manifest.nodeEngine, packageJson.engines.node);
  assert.equal(manifest.dataSchemaVersion, 17);
  assert.equal(APP_DATA_SCHEMA_VERSION, 17);
  assert.equal(manifest.status, "released");
  assert.equal(manifest.tag, "v2.3.0");
});

test("final manifest preserves the verified Phase 152 candidate evidence", () => {
  assert.equal(manifest.verifiedCandidateCommitPrefix, "75b7be6");
  assert.equal(manifest.verifiedCandidateTestCount, 575);
  assert.equal(manifest.expectedFinalTestCount, 581);
});

test("2.3.0 keeps every browser gate and the five-step release order", () => {
  assert.equal(manifest.browserGate, "scripts/production-browser-smoke.mjs");
  assert.equal(manifest.freelancerBrowserGate, "scripts/freelancer-browser-ux-smoke.mjs");
  assert.equal(manifest.employeeBrowserGate, "scripts/employee-browser-ux-smoke.mjs");
  assert.equal(manifest.pairingBrowserGate, "scripts/device-pairing-browser-smoke.mjs");
  assert.equal(manifest.pairingCommand, "npm run test:browser:pairing");
  assert.equal(
    packageJson.scripts["check:release"],
    "npm run check:quality && npm run check:release:audit && npm run test:browser:production:built && npm run test:browser:freelancer:built && npm run test:browser:employee:built",
  );
});

test("2.3.0 release docs and product media remain wired", () => {
  assert.match(read(manifest.releaseNotes.fa), /ساعت‌یار ۲\.۳\.۰/);
  assert.match(read(manifest.releaseNotes.en), /Saatyar 2\.3\.0/);
  assert.ok(read("CHANGELOG.md").split(/\r?\n/).includes("## [2.3.0] - 2026-08-08"));
  assert.equal(read("RELEASE_CHECKLIST_FA.md").split(/\r?\n/)[0], "# چک‌لیست انتشار ساعت‌یار 2.3.0");
  assert.match(read("README.md"), /RELEASE_NOTES_2\.3\.0_FA\.md/);
  assert.match(read("README_EN.md"), /RELEASE_NOTES_2\.3\.0_EN\.md/);
  for (const path of requiredMedia) {
    assert.ok(read("README.md").includes(path), `Persian README missing ${path}`);
    assert.ok(read("README_EN.md").includes(path), `English README missing ${path}`);
  }
});

test("roadmap preserves Phase 152 and closes Phase 153 finalization", () => {
  const backlog = read("docs/roadmap/BACKLOG_FA.md");
  const start = backlog.indexOf("## آمادگی انتشار ۲.۳.۰");
  assert.ok(start >= 0);
  const section = backlog.slice(start);
  assert.match(section, /- \[x\] فاز ۱۵۲:/);
  assert.match(section, /- \[x\] فاز ۱۵۳:/);
  assert.match(read("docs/phases/PHASE_152_NOTES_FA.md"), /575 tests/);
});

test("active final audit passes and Phase 152 stays in npm test", () => {
  assert.deepEqual(collectReleaseAuditFailures(), []);
  assert.match(packageJson.scripts.test, /tests\/phase152-release-2\.3\.0-candidate\.test\.ts/);
});
