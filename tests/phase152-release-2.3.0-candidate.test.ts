import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { collectReleaseAuditFailures } from "../scripts/release-audit.mjs";

const read = (path: string) => readFileSync(path, "utf8");
const packageJson = JSON.parse(read("package.json")) as {
  scripts: Record<string, string>;
};
const manifest = JSON.parse(read("docs/releases/2.3.0.json")) as {
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

test("historical 2.3.0 candidate version Node schema and tag remain immutable", () => {
  assert.equal(manifest.version, "2.3.0");
  assert.equal(manifest.releaseDate, "2026-08-08");
  assert.equal(manifest.nodeEngine, "22.x");
  assert.equal(manifest.dataSchemaVersion, 17);
  assert.equal(manifest.status, "released");
  assert.equal(manifest.tag, "v2.3.0");
});

test("historical 2.3.0 manifest preserves the verified Phase 152 candidate evidence", () => {
  assert.equal(manifest.verifiedCandidateCommitPrefix, "75b7be6");
  assert.equal(manifest.verifiedCandidateTestCount, 575);
  assert.equal(manifest.expectedFinalTestCount, 581);
});

test("historical 2.3.0 keeps every browser gate contract", () => {
  assert.equal(manifest.browserGate, "scripts/production-browser-smoke.mjs");
  assert.equal(manifest.freelancerBrowserGate, "scripts/freelancer-browser-ux-smoke.mjs");
  assert.equal(manifest.employeeBrowserGate, "scripts/employee-browser-ux-smoke.mjs");
  assert.equal(manifest.pairingBrowserGate, "scripts/device-pairing-browser-smoke.mjs");
  assert.equal(manifest.pairingCommand, "npm run test:browser:pairing");
});

test("historical 2.3.0 release docs changelog and product media remain available", () => {
  assert.match(read(manifest.releaseNotes.fa), /ساعت‌یار ۲\.۳\.۰/);
  assert.match(read(manifest.releaseNotes.en), /Saatyar 2\.3\.0/);
  assert.ok(read("CHANGELOG.md").split(/\r?\n/).includes("## [2.3.0] - 2026-08-08"));
  assert.match(read("README_FA.md"), /RELEASE_NOTES_2\.3\.0_FA\.md/);
  assert.match(read("README.md"), /RELEASE_NOTES_2\.3\.0_EN\.md/);
  for (const path of requiredMedia) {
    assert.ok(read("README_FA.md").includes(path), `Persian README missing ${path}`);
    assert.ok(read("README.md").includes(path), `English README missing ${path}`);
  }
});

test("roadmap preserves Phase 152 and Phase 153 historical finalization", () => {
  const backlog = read("docs/roadmap/BACKLOG_FA.md");
  const start = backlog.indexOf("## آمادگی انتشار ۲.۳.۰");
  assert.ok(start >= 0);
  const section = backlog.slice(start);
  assert.match(section, /- \[x\] فاز ۱۵۲:/);
  assert.match(section, /- \[x\] فاز ۱۵۳:/);
  assert.match(read("docs/phases/PHASE_152_NOTES_FA.md"), /575 tests/);
});

test("current release audit passes while historical Phase 152 stays in npm test", () => {
  assert.deepEqual(collectReleaseAuditFailures(), []);
  assert.match(packageJson.scripts.test, /tests\/phase152-release-2\.3\.0-candidate\.test\.ts/);
});
