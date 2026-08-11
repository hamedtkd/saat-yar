import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { collectReleaseAuditFailures } from "../scripts/release-audit.mjs";

const read = (path: string) => readFileSync(path, "utf8");
const packageJson = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
const manifest = JSON.parse(read("docs/releases/2.3.2.json")) as {
  version: string; releaseDate: string; status: string; dataSchemaVersion: number; nodeEngine: string;
  verifiedBaselineCommitPrefix: string; verifiedBaselineTestCount: number; expectedFinalTestCount: number;
  qualityCommand: string; pairingCommand: string; productionAuditCommand: string; vercelAuditCommand: string;
  releaseNotes: { fa: string; en: string }; tag: string; releaseEvidence: Record<string, unknown>;
};

test("historical 2.3.2 version schema date and tag remain immutable", () => {
  assert.equal(manifest.version, "2.3.2");
  assert.equal(manifest.releaseDate, "2026-08-09");
  assert.equal(manifest.status, "released");
  assert.equal(manifest.nodeEngine, "22.x");
  assert.equal(manifest.dataSchemaVersion, 17);
  assert.equal(manifest.tag, "v2.3.2");
});

test("historical 2.3.2 preserves its production-audited baseline and 639-test final gate", () => {
  assert.equal(manifest.verifiedBaselineCommitPrefix, "e3c0a03");
  assert.equal(manifest.verifiedBaselineTestCount, 633);
  assert.equal(manifest.expectedFinalTestCount, 639);
  assert.deepEqual(manifest.releaseEvidence, {
    productionBrowserSmoke: "passed", freelancerBrowserSmoke: "passed", employeeBrowserSmoke: "passed",
    pairingBrowserSmoke: "passed", pairingEncryptedChunks: 4, vercelStaticExportAudit: "passed",
    productionDomainAudit: "passed", productionPrecacheAssets: 37, phase164FinalTestCount: 633,
  });
});

test("historical 2.3.2 release docs and bilingual notes remain available", () => {
  assert.match(read(manifest.releaseNotes.fa), /ساعت‌یار ۲\.۳\.۲/);
  assert.match(read(manifest.releaseNotes.en), /Saatyar 2\.3\.2/);
  assert.ok(read("CHANGELOG.md").split(/\r?\n/).includes("## [2.3.2] - 2026-08-09"));
  assert.match(read("docs/phases/PHASE_165_NOTES_FA.md"), /Final Release 2\.3\.2/);
});

test("historical 2.3.2 keeps its release gates and source-of-truth tag contract", () => {
  assert.equal(manifest.qualityCommand, "npm run check:release");
  assert.equal(manifest.pairingCommand, "npm run test:browser:pairing");
  assert.equal(manifest.vercelAuditCommand, "npm run audit:vercel");
  assert.equal(manifest.productionAuditCommand, "npm run audit:production");
  assert.equal(Object.prototype.hasOwnProperty.call(manifest, "releaseCommit"), false);
});

test("historical Phase 165 checklist and preparation command remain available", () => {
  assert.match(read("docs/phases/PHASE_165_NOTES_FA.md"), /npm run release:prepare:2\.3\.2/);
  assert.match(read("docs/roadmap/BACKLOG_FA.md"), /## آمادگی انتشار ۲\.۳\.۲/);
  assert.equal(packageJson.scripts["release:prepare:2.3.2"], "node scripts/prepare-release-2.3.2.mjs");
});

test("current release audit passes while historical Phase 165 remains in npm test", () => {
  assert.deepEqual(collectReleaseAuditFailures(), []);
  assert.match(packageJson.scripts.test, /tests\/phase165-release-2\.3\.2-finalization\.test\.ts/);
});
