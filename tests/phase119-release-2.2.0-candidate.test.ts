import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { collectReleaseAuditFailures } from "../scripts/release-audit.mjs";

const read = (path: string) => readFileSync(path, "utf8");
const packageJson = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
const manifest = JSON.parse(read("docs/releases/2.2.0.json")) as {
  version: string;
  releaseDate: string;
  status: string;
  dataSchemaVersion: number;
  nodeEngine: string;
  verifiedCandidateCommitPrefix: string;
  verifiedCandidateTestCount: number;
  expectedFinalTestCount: number;
  pairingCommand: string;
  pairingBrowserGate: string;
  releaseNotes: { fa: string; en: string };
  tag: string;
};

test("historical 2.2.0 candidate and schema evidence remain immutable after later releases", () => {
  assert.equal(manifest.version, "2.2.0");
  assert.equal(manifest.nodeEngine, "22.x");
  assert.equal(manifest.dataSchemaVersion, 17);
  assert.equal(manifest.status, "released");
  assert.equal(manifest.tag, "v2.2.0");
});

test("2.2.0 candidate gate evidence is preserved historically", () => {
  assert.equal(manifest.verifiedCandidateCommitPrefix, "f659456");
  assert.equal(manifest.verifiedCandidateTestCount, 423);
  assert.equal(manifest.expectedFinalTestCount, 429);
  assert.equal(manifest.pairingCommand, "npm run test:browser:pairing");
  assert.equal(manifest.pairingBrowserGate, "scripts/device-pairing-browser-smoke.mjs");
});

test("historical 2.2.0 release notes changelog and readme links remain available", () => {
  const fa = read(manifest.releaseNotes.fa);
  const en = read(manifest.releaseNotes.en);
  assert.match(fa, /ساعت‌یار ۲\.۲\.۰/);
  assert.match(en, /Saatyar 2\.2\.0/);
  assert.ok(read("CHANGELOG.md").split(/\r?\n/).includes(`## [2.2.0] - ${manifest.releaseDate}`));
  assert.match(read("README.md"), /RELEASE_NOTES_2\.2\.0_FA\.md/);
  assert.match(read("README_EN.md"), /RELEASE_NOTES_2\.2\.0_EN\.md/);
  assert.match(read("docs/phases/PHASE_119_NOTES_FA.md"), /Release Candidate 2\.2\.0/);
});

test("both readmes retain the released product media references", () => {
  for (const path of [
    "docs/assets/screenshots/today-light-desktop.png",
    "docs/assets/screenshots/today-dark-desktop.png",
    "docs/assets/screenshots/today-mobile.png",
    "docs/assets/screenshots/reports-light.png",
    "docs/assets/screenshots/reports-dark.png",
    "docs/assets/media/onboarding.gif",
  ]) {
    assert.ok(read("README.md").includes(path), `Persian README missing ${path}`);
    assert.ok(read("README_EN.md").includes(path), `English README missing ${path}`);
  }
});

test("2.2.0 preparation and final source phases stay closed in the roadmap", () => {
  const backlog = read("docs/roadmap/BACKLOG_FA.md");
  assert.match(backlog, /- \[x\] فاز ۱۱۹:/);
  assert.match(backlog, /- \[x\] فاز ۱۲۰:/);
  assert.match(backlog, /Tag `v2\.2\.0`/);
});

test("current release audit passes while the historical Phase 119 contract stays in npm test", () => {
  assert.deepEqual(collectReleaseAuditFailures(), []);
  assert.match(packageJson.scripts.test, /tests\/phase119-release-2\.2\.0-candidate\.test\.ts/);
});
