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
const manifest = JSON.parse(read("docs/releases/2.2.0.json")) as {
  version: string;
  releaseDate: string;
  status: string;
  dataSchemaVersion: number;
  nodeEngine: string;
  verifiedCandidateCommitPrefix?: string;
  verifiedCandidateTestCount?: number;
  expectedFinalTestCount?: number;
  pairingCommand: string;
  pairingBrowserGate: string;
  releaseNotes: { fa: string; en: string };
  tag: string;
};

test("2.2.0 candidate version and schema evidence remain valid after finalization", () => {
  assert.equal(packageJson.version, "2.2.0");
  assert.equal(packageLock.version, "2.2.0");
  assert.equal(packageLock.packages[""]?.version, "2.2.0");
  assert.equal(manifest.version, "2.2.0");
  assert.equal(manifest.nodeEngine, packageJson.engines.node);
  assert.equal(manifest.dataSchemaVersion, 17);
  assert.equal(APP_DATA_SCHEMA_VERSION, 17);
  assert.ok(["release-candidate", "released"].includes(manifest.status));
  assert.equal(manifest.tag, "v2.2.0");
});

test("candidate gate evidence is preserved when the release is finalized", () => {
  assert.equal(manifest.verifiedCandidateCommitPrefix, "f659456");
  assert.equal(manifest.verifiedCandidateTestCount, 423);
  assert.equal(manifest.expectedFinalTestCount, 429);
  assert.equal(manifest.pairingCommand, "npm run test:browser:pairing");
  assert.equal(manifest.pairingBrowserGate, "scripts/device-pairing-browser-smoke.mjs");
});

test("release notes changelog checklist and readmes expose 2.2.0", () => {
  const fa = read(manifest.releaseNotes.fa);
  const en = read(manifest.releaseNotes.en);
  assert.match(fa, /ساعت‌یار ۲\.۲\.۰/);
  assert.match(en, /Saatyar 2\.2\.0/);
  assert.ok(read("CHANGELOG.md").split(/\r?\n/).includes(`## [2.2.0] - ${manifest.releaseDate}`));
  assert.equal(read("RELEASE_CHECKLIST_FA.md").split(/\r?\n/)[0], "# چک‌لیست انتشار ساعت‌یار 2.2.0");
  assert.match(read("README.md"), /RELEASE_NOTES_2\.2\.0_FA\.md/);
  assert.match(read("README_EN.md"), /RELEASE_NOTES_2\.2\.0_EN\.md/);
});

test("both readmes embed the final screenshot and onboarding media paths", () => {
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

test("2.2.0 preparation and final source phases are closed in the roadmap", () => {
  const backlog = read("docs/roadmap/BACKLOG_FA.md");
  const start = backlog.indexOf("## آمادگی انتشار ۲.۲.۰");
  const end = backlog.indexOf("## قابلیت‌های پس از Design Freeze", start);
  assert.ok(start >= 0 && end > start);
  const section = backlog.slice(start, end);
  assert.doesNotMatch(section, /- \[ \]/);
  assert.match(backlog, /- \[x\] فاز ۱۱۹:/);
  assert.match(backlog, /- \[x\] فاز ۱۲۰:/);
});

test("active 2.2.0 release audit passes and phase 119 stays in npm test", () => {
  assert.deepEqual(collectReleaseAuditFailures(), []);
  assert.match(packageJson.scripts.test, /tests\/phase119-release-2\.2\.0-candidate\.test\.ts/);
});
