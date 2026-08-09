import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";
import { collectReleaseAuditFailures } from "../scripts/release-audit.mjs";

const read = (path: string) => readFileSync(path, "utf8");
const packageJson = JSON.parse(read("package.json")) as { version: string; engines: { node: string }; scripts: Record<string, string> };
const packageLock = JSON.parse(read("package-lock.json")) as { version: string; packages: Record<string, { version?: string }> };
const manifest = JSON.parse(read("docs/releases/2.3.2.json")) as {
  version: string; releaseDate: string; status: string; dataSchemaVersion: number; nodeEngine: string;
  verifiedBaselineCommitPrefix: string; verifiedBaselineTestCount: number; expectedFinalTestCount: number;
  qualityCommand: string; pairingCommand: string; productionAuditCommand: string; vercelAuditCommand: string;
  releaseNotes: { fa: string; en: string }; tag: string; releaseEvidence: Record<string, unknown>;
};

test("2.3.2 version lock schema date and tag are aligned", () => {
  assert.equal(packageJson.version, "2.3.2");
  assert.equal(packageLock.version, "2.3.2");
  assert.equal(packageLock.packages[""]?.version, "2.3.2");
  assert.equal(manifest.version, "2.3.2");
  assert.equal(manifest.releaseDate, "2026-08-09");
  assert.equal(manifest.status, "released");
  assert.equal(manifest.nodeEngine, packageJson.engines.node);
  assert.equal(manifest.dataSchemaVersion, 17);
  assert.equal(APP_DATA_SCHEMA_VERSION, 17);
  assert.equal(manifest.tag, "v2.3.2");
});

test("2.3.2 records the production-audited Phase 164 baseline and 639-test final gate", () => {
  assert.match(manifest.verifiedBaselineCommitPrefix, /^[0-9a-f]{7,40}$/);
  assert.notEqual(manifest.verifiedBaselineCommitPrefix, "0000000");
  assert.equal(manifest.verifiedBaselineTestCount, 633);
  assert.equal(manifest.expectedFinalTestCount, 639);
  assert.deepEqual(manifest.releaseEvidence, {
    productionBrowserSmoke: "passed", freelancerBrowserSmoke: "passed", employeeBrowserSmoke: "passed",
    pairingBrowserSmoke: "passed", pairingEncryptedChunks: 4, vercelStaticExportAudit: "passed",
    productionDomainAudit: "passed", productionPrecacheAssets: 37, phase164FinalTestCount: 633,
  });
});

test("2.3.2 packages Phases 160 through 164 with bilingual release notes", () => {
  const notes = read("docs/phases/PHASE_165_NOTES_FA.md");
  for (const phase of ["۱۶۰", "۱۶۱", "۱۶۲", "۱۶۳", "۱۶۴"]) assert.match(notes, new RegExp(`فاز ${phase}`));
  assert.match(read(manifest.releaseNotes.fa), /ساعت‌یار ۲\.۳\.۲/);
  assert.match(read(manifest.releaseNotes.en), /Saatyar 2\.3\.2/);
  assert.match(read("README.md"), /RELEASE_NOTES_2\.3\.2_EN\.md/);
  assert.match(read("README_FA.md"), /RELEASE_NOTES_2\.3\.2_FA\.md/);
  assert.ok(read("CHANGELOG.md").split(/\r?\n/).includes("## [2.3.2] - 2026-08-09"));
});

test("2.3.2 keeps historical manifests immutable and release gates explicit", () => {
  const historical = JSON.parse(read("docs/releases/2.3.1.json")) as { version: string; tag: string; expectedFinalTestCount: number };
  assert.equal(historical.version, "2.3.1");
  assert.equal(historical.tag, "v2.3.1");
  assert.equal(historical.expectedFinalTestCount, 607);
  assert.equal(manifest.qualityCommand, "npm run check:release");
  assert.equal(manifest.pairingCommand, "npm run test:browser:pairing");
  assert.equal(manifest.vercelAuditCommand, "npm run audit:vercel");
  assert.equal(manifest.productionAuditCommand, "npm run audit:production");
  assert.equal(Object.prototype.hasOwnProperty.call(manifest, "releaseCommit"), false);
});

test("2.3.2 checklist requires prepare gate production audit and annotated tag", () => {
  const checklist = read("RELEASE_CHECKLIST_FA.md");
  assert.equal(checklist.split(/\r?\n/)[0], "# چک‌لیست انتشار ساعت‌یار 2.3.2");
  assert.match(checklist, /npm run release:prepare:2\.3\.2/);
  assert.match(checklist, /639\/639/);
  assert.match(checklist, /npm run audit:production/);
  assert.match(checklist, /git tag -a v2\.3\.2 -m "Saatyar 2\.3\.2"/);
  assert.match(read("docs/roadmap/BACKLOG_FA.md"), /## آمادگی انتشار ۲\.۳\.۲/);
});

test("active 2.3.2 release audit passes and Phase 165 is wired into npm test", () => {
  assert.deepEqual(collectReleaseAuditFailures(), []);
  assert.match(packageJson.scripts.test, /tests\/phase165-release-2\.3\.2-finalization\.test\.ts/);
  assert.equal(packageJson.scripts["release:prepare:2.3.2"], "node scripts/prepare-release-2.3.2.mjs");
});
