import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";

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
const manifest = JSON.parse(read("docs/releases/2.3.1.json")) as Record<string, unknown> & {
  version: string;
  releaseDate: string;
  status: string;
  dataSchemaVersion: number;
  nodeEngine: string;
  verifiedBaselineCommitPrefix: string;
  verifiedBaselineTestCount: number;
  expectedFinalTestCount: number;
  qualityCommand: string;
  browserGate: string;
  freelancerBrowserGate: string;
  employeeBrowserGate: string;
  pairingBrowserGate: string;
  pairingCommand: string;
  productionAuditCommand: string;
  vercelAuditCommand: string;
  releaseNotes: { fa: string; en: string };
  tag: string;
  releaseEvidence: {
    productionBrowserSmoke: string;
    freelancerBrowserSmoke: string;
    employeeBrowserSmoke: string;
    pairingBrowserSmoke: string;
    pairingEncryptedChunks: number;
    vercelStaticExportAudit: string;
    productionDomainAudit: string;
    productionPrecacheAssets: number;
    employeeNetMinutes: number;
  };
};

test("historical 2.3.1 patch release manifest schema and tag remain aligned", () => {
  assert.equal(manifest.version, "2.3.1");
  assert.equal(manifest.releaseDate, "2026-08-08");
  assert.equal(manifest.status, "released");
  assert.equal(manifest.nodeEngine, packageJson.engines.node);
  assert.equal(manifest.dataSchemaVersion, 17);
  assert.equal(APP_DATA_SCHEMA_VERSION, 17);
  assert.equal(manifest.tag, "v2.3.1");
});

test("2.3.1 preserves the verified Phase 158 baseline and declares the 607-test final gate", () => {
  assert.equal(manifest.verifiedBaselineCommitPrefix, "7c675e1");
  assert.equal(manifest.verifiedBaselineTestCount, 601);
  assert.equal(manifest.expectedFinalTestCount, 607);
  assert.deepEqual(manifest.releaseEvidence, {
    productionBrowserSmoke: "passed",
    freelancerBrowserSmoke: "passed",
    employeeBrowserSmoke: "passed",
    pairingBrowserSmoke: "passed",
    pairingEncryptedChunks: 4,
    vercelStaticExportAudit: "passed",
    productionDomainAudit: "passed",
    productionPrecacheAssets: 37,
    employeeNetMinutes: 495,
  });
});

test("2.3.1 release docs package Phases 155 through 158 while 2.3.0 stays historical", () => {
  const fa = read(manifest.releaseNotes.fa);
  const en = read(manifest.releaseNotes.en);
  assert.match(fa, /ساعت‌یار ۲\.۳\.۱/);
  assert.match(en, /Saatyar 2\.3\.1/);
  for (const phase of ["۱۵۵", "۱۵۶", "۱۵۷", "۱۵۸"]) {
    assert.match(read("docs/phases/PHASE_159_NOTES_FA.md"), new RegExp(`فاز ${phase}`));
  }
  assert.match(read("README_FA.md"), /RELEASE_NOTES_2\.3\.1_FA\.md/);
  assert.match(read("README_FA.md"), /RELEASE_NOTES_2\.3\.0_FA\.md/);
  assert.match(read("README.md"), /RELEASE_NOTES_2\.3\.1_EN\.md/);
  assert.ok(read("CHANGELOG.md").split(/\r?\n/).includes("## [2.3.1] - 2026-08-08"));
  const historical = JSON.parse(read("docs/releases/2.3.0.json")) as { version: string; tag: string; expectedFinalTestCount: number };
  assert.equal(historical.version, "2.3.0");
  assert.equal(historical.tag, "v2.3.0");
  assert.equal(historical.expectedFinalTestCount, 581);
});

test("2.3.1 keeps the release browser gates and both deployment audits explicit", () => {
  assert.equal(
    packageJson.scripts["check:release"],
    "npm run check:quality && npm run check:release:audit && npm run test:browser:production:built && npm run test:browser:freelancer:built && npm run test:browser:employee:built",
  );
  assert.equal(manifest.qualityCommand, "npm run check:release");
  assert.equal(manifest.browserGate, "scripts/production-browser-smoke.mjs");
  assert.equal(manifest.freelancerBrowserGate, "scripts/freelancer-browser-ux-smoke.mjs");
  assert.equal(manifest.employeeBrowserGate, "scripts/employee-browser-ux-smoke.mjs");
  assert.equal(manifest.pairingBrowserGate, "scripts/device-pairing-browser-smoke.mjs");
  assert.equal(manifest.pairingCommand, "npm run test:browser:pairing");
  assert.equal(manifest.vercelAuditCommand, "npm run audit:vercel");
  assert.equal(manifest.productionAuditCommand, "npm run audit:production");
});

test("historical 2.3.1 roadmap and phase notes preserve the annotated-tag contract", () => {
  const phaseNotes = read("docs/phases/PHASE_159_NOTES_FA.md");
  const backlog = read("docs/roadmap/BACKLOG_FA.md");
  assert.match(phaseNotes, /npm run audit:production/);
  assert.match(phaseNotes, /git tag -a v2\.3\.1 -m "Saatyar 2\.3\.1"/);
  assert.match(backlog, /## آمادگی انتشار ۲\.۳\.۱/);
  assert.match(backlog, /- \[x\] فاز ۱۵۹:/);
  assert.equal(Object.prototype.hasOwnProperty.call(manifest, "releaseCommit"), false);
});

test("historical Phase 159 remains wired after the active release advances", () => {
  assert.match(packageJson.scripts.test, /tests\/phase159-release-2\.3\.1-finalization\.test\.ts/);
  assert.equal(packageLock.packages[""]?.version, packageJson.version);
});
