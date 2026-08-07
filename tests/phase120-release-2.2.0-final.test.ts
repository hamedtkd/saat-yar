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

test("2.2.0 final manifest is released on schema v17", () => {
  assert.equal(manifest.version, "2.2.0");
  assert.equal(manifest.status, "released");
  assert.equal(manifest.dataSchemaVersion, 17);
  assert.equal(manifest.tag, "v2.2.0");
});

test("final manifest records the verified Phase 119 candidate evidence", () => {
  assert.equal(manifest.verifiedCandidateCommitPrefix, "f659456");
  assert.equal(manifest.verifiedCandidateTestCount, 423);
  assert.equal(manifest.expectedFinalTestCount, 429);
  assert.deepEqual(manifest.releaseEvidence, {
    productionBrowserSmoke: "passed",
    pairingBrowserSmoke: "passed",
    pairingEncryptedChunks: 4,
  });
});

test("release manifest avoids an impossible self-referential commit hash", () => {
  assert.equal(Object.prototype.hasOwnProperty.call(manifest, "releaseCommit"), false);
  assert.match(read("RELEASE_CHECKLIST_FA.md"), /Tag annotated منبع حقیقت Commit انتشار است/);
  assert.match(read("docs/releases/RELEASE_NOTES_2.2.0_EN.md"), /annotated `v2\.2\.0` Git tag is the source of truth/);
});

test("readmes and release notes present 2.2.0 as the finalized release source", () => {
  assert.match(read("README.md"), /نسخه \*\*۲\.۲\.۰\*\* به‌عنوان Release نهایی آماده شده است/);
  assert.match(read("README_EN.md"), /Version \*\*2\.2\.0\*\* is finalized in the release source/);
  assert.match(read("docs/releases/RELEASE_NOTES_2.2.0_FA.md"), /Manifest نسخه ۲\.۲\.۰ اکنون `released` است/);
});

test("phase 120 closes source finalization while tag creation remains an external git action", () => {
  const backlog = read("docs/roadmap/BACKLOG_FA.md");
  assert.match(backlog, /- \[x\] فاز ۱۲۰:/);
  const checklist = read("RELEASE_CHECKLIST_FA.md");
  assert.match(checklist, /- \[ \] Tag annotated `v2\.2\.0`/);
  assert.match(checklist, /git tag -a v2\.2\.0 -m "Saatyar 2\.2\.0"/);
});

test("final release contract is audited and wired into npm test", () => {
  assert.deepEqual(collectReleaseAuditFailures(), []);
  assert.match(packageJson.scripts.test, /tests\/phase120-release-2\.2\.0-final\.test\.ts/);
});
