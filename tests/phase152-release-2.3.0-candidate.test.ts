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
const manifest = JSON.parse(read("docs/releases/2.3.0.json")) as {
  version: string;
  releaseDate: string;
  status: string;
  dataSchemaVersion: number;
  nodeEngine: string;
  verifiedBaselineCommitPrefix: string;
  verifiedTestCount: number;
  expectedCandidateTestCount: number;
  browserGate: string;
  freelancerBrowserGate: string;
  employeeBrowserGate: string;
  pairingBrowserGate: string;
  pairingCommand: string;
  releaseNotes: { fa: string; en: string };
  baselineEvidence: {
    productionBrowserSmoke: string;
    freelancerBrowserSmoke: string;
    employeeBrowserSmoke: string;
    employeeNetMinutes: number;
  };
  releaseCommit: string | null;
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

test("2.3.0 release candidate aligns package lockfile Node and schema v17", () => {
  assert.equal(packageJson.version, "2.3.0");
  assert.equal(packageLock.version, "2.3.0");
  assert.equal(packageLock.packages[""]?.version, "2.3.0");
  assert.equal(manifest.version, "2.3.0");
  assert.equal(manifest.releaseDate, "2026-08-08");
  assert.equal(manifest.nodeEngine, packageJson.engines.node);
  assert.equal(manifest.dataSchemaVersion, 17);
  assert.equal(APP_DATA_SCHEMA_VERSION, 17);
  assert.equal(manifest.status, "release-candidate");
  assert.equal(manifest.releaseCommit, null);
  assert.equal(manifest.tag, "v2.3.0");
});

test("candidate records the fully green Phase 151 baseline and expected Phase 152 gate", () => {
  assert.equal(manifest.verifiedBaselineCommitPrefix, "ff0177f");
  assert.equal(manifest.verifiedTestCount, 569);
  assert.equal(manifest.expectedCandidateTestCount, 575);
  assert.deepEqual(manifest.baselineEvidence, {
    productionBrowserSmoke: "passed",
    freelancerBrowserSmoke: "passed",
    employeeBrowserSmoke: "passed",
    employeeNetMinutes: 495,
  });
});

test("release manifest exposes every browser gate without weakening the current check:release order", () => {
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

test("2.3.0 release notes changelog checklist readmes and product media are wired", () => {
  assert.match(read(manifest.releaseNotes.fa), /ساعت‌یار ۲\.۳\.۰/);
  assert.match(read(manifest.releaseNotes.en), /Saatyar 2\.3\.0/);
  assert.ok(read("CHANGELOG.md").split(/\r?\n/).includes("## [2.3.0] - 2026-08-08"));
  assert.equal(read("RELEASE_CHECKLIST_FA.md").split(/\r?\n/)[0], "# چک‌لیست انتشار ساعت‌یار 2.3.0");
  assert.match(read("README.md"), /RELEASE_NOTES_2\.3\.0_FA\.md/);
  assert.match(read("README_EN.md"), /RELEASE_NOTES_2\.3\.0_EN\.md/);
  assert.match(read("docs/README.md"), /\.\/releases\/2\.3\.0\.json/);

  for (const path of requiredMedia) {
    assert.ok(read("README.md").includes(path), `Persian README missing ${path}`);
    assert.ok(read("README_EN.md").includes(path), `English README missing ${path}`);
  }
  assert.match(read("docs/assets/README.md"), /npm run media:capture/);
  assert.match(read("docs/assets/README.md"), /Fixture/);
});

test("roadmap closes Phase 152 while final 2.3.0 release remains Phase 153", () => {
  const backlog = read("docs/roadmap/BACKLOG_FA.md");
  const start = backlog.indexOf("## آمادگی انتشار ۲.۳.۰");
  assert.ok(start >= 0);
  const section = backlog.slice(start);
  assert.match(section, /- \[x\] فاز ۱۵۲:/);
  assert.match(section, /- \[ \] فاز ۱۵۳:/);
  assert.match(read("docs/phases/PHASE_152_NOTES_FA.md"), /575 tests/);
});

test("active 2.3.0 candidate audit passes and Phase 152 is wired into npm test", () => {
  assert.deepEqual(collectReleaseAuditFailures(), []);
  assert.match(packageJson.scripts.test, /tests\/phase152-release-2\.3\.0-candidate\.test\.ts/);
});
