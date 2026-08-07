import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { collectReleaseAuditFailures } from "../scripts/release-audit.mjs";

const read = (path: string) => readFileSync(path, "utf8");
const manifest = JSON.parse(read("docs/releases/2.2.0.json")) as Record<string, unknown> & {
  status: string;
  version: string;
  dataSchemaVersion: number;
  verifiedCandidateCommitPrefix: string;
  verifiedCandidateTestCount: number;
  expectedFinalTestCount: number;
  tag: string;
  releaseEvidence: {
    productionBrowserSmoke: string;
    pairingBrowserSmoke: string;
    pairingEncryptedChunks: number;
  };
};
const packageJson = JSON.parse(read("package.json")) as { scripts: Record<string, string> };

test("historical 2.2.0 final manifest remains released on schema v17", () => {
  assert.equal(manifest.version, "2.2.0");
  assert.equal(manifest.status, "released");
  assert.equal(manifest.dataSchemaVersion, 17);
  assert.equal(manifest.tag, "v2.2.0");
});

test("historical final manifest preserves the verified Phase 119 candidate evidence", () => {
  assert.equal(manifest.verifiedCandidateCommitPrefix, "f659456");
  assert.equal(manifest.verifiedCandidateTestCount, 423);
  assert.equal(manifest.expectedFinalTestCount, 429);
  assert.deepEqual(manifest.releaseEvidence, {
    productionBrowserSmoke: "passed",
    pairingBrowserSmoke: "passed",
    pairingEncryptedChunks: 4,
  });
});

test("2.2.0 release contract avoids an impossible self-referential commit hash", () => {
  assert.equal(Object.prototype.hasOwnProperty.call(manifest, "releaseCommit"), false);
  assert.match(read("docs/phases/PHASE_120_NOTES_FA.md"), /Tag annotated `v2\.2\.0` منبع حقیقت Commit نهایی انتشار است/);
  assert.match(read("docs/releases/RELEASE_NOTES_2.2.0_EN.md"), /annotated `v2\.2\.0` Git tag is the source of truth/);
});

test("readmes retain 2.2.0 as historical release documentation while 2.3.0 advances", () => {
  assert.match(read("README.md"), /RELEASE_NOTES_2\.2\.0_FA\.md/);
  assert.match(read("README_EN.md"), /RELEASE_NOTES_2\.2\.0_EN\.md/);
  assert.match(read("docs/releases/RELEASE_NOTES_2.2.0_FA.md"), /Manifest نسخه ۲\.۲\.۰ اکنون `released` است/);
  assert.match(read("README.md"), /نسخه \*\*۲\.۳\.۰\*\* اکنون منتشر شده است/);
});

test("phase 120 stays closed and the published 2.2.0 tag remains recorded", () => {
  const backlog = read("docs/roadmap/BACKLOG_FA.md");
  assert.match(backlog, /- \[x\] فاز ۱۲۰:/);
  assert.match(backlog, /Tag `v2\.2\.0` روی Commit نهایی `d197b7d`/);
  assert.match(read("docs/phases/PHASE_120_NOTES_FA.md"), /git tag -a v2\.2\.0 -m "Saatyar 2\.2\.0"/);
});

test("current release contract is audited and historical Phase 120 remains in npm test", () => {
  assert.deepEqual(collectReleaseAuditFailures(), []);
  assert.match(packageJson.scripts.test, /tests\/phase120-release-2\.2\.0-final\.test\.ts/);
});
