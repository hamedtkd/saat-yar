import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { collectReleaseAuditFailures } from "../scripts/release-audit.mjs";

const read = (path: string) => readFileSync(path, "utf8");
const manifest = JSON.parse(read("docs/releases/2.3.0.json")) as Record<string, unknown> & {
  version: string;
  status: string;
  dataSchemaVersion: number;
  verifiedCandidateCommitPrefix: string;
  verifiedCandidateTestCount: number;
  expectedFinalTestCount: number;
  tag: string;
  releaseEvidence: {
    productionBrowserSmoke: string;
    freelancerBrowserSmoke: string;
    employeeBrowserSmoke: string;
    pairingBrowserSmoke: string;
    pairingEncryptedChunks: number;
    employeeNetMinutes: number;
  };
};
const packageJson = JSON.parse(read("package.json")) as { scripts: Record<string, string> };

test("historical 2.3.0 final manifest remains released on schema v17", () => {
  assert.equal(manifest.version, "2.3.0");
  assert.equal(manifest.status, "released");
  assert.equal(manifest.dataSchemaVersion, 17);
  assert.equal(manifest.tag, "v2.3.0");
});

test("historical 2.3.0 final manifest preserves the verified Phase 152 gate", () => {
  assert.equal(manifest.verifiedCandidateCommitPrefix, "75b7be6");
  assert.equal(manifest.verifiedCandidateTestCount, 575);
  assert.equal(manifest.expectedFinalTestCount, 581);
});

test("historical 2.3.0 release evidence remains immutable", () => {
  assert.deepEqual(manifest.releaseEvidence, {
    productionBrowserSmoke: "passed",
    freelancerBrowserSmoke: "passed",
    employeeBrowserSmoke: "passed",
    pairingBrowserSmoke: "passed",
    pairingEncryptedChunks: 4,
    employeeNetMinutes: 495,
  });
});

test("historical 2.3.0 final contract avoids a self-referential release commit", () => {
  assert.equal(Object.prototype.hasOwnProperty.call(manifest, "releaseCommit"), false);
  assert.match(read("docs/phases/PHASE_153_NOTES_FA.md"), /Tag annotated `v2\.3\.0` منبع حقیقت Commit نهایی انتشار است/);
  assert.match(read("docs/releases/RELEASE_NOTES_2.3.0_EN.md"), /annotated `v2\.3\.0` Git tag.*source of truth/);
});

test("2.3.0 release docs remain available after 2.3.1 advances", () => {
  assert.match(read("README_FA.md"), /RELEASE_NOTES_2\.3\.0_FA\.md/);
  assert.match(read("README.md"), /RELEASE_NOTES_2\.3\.0_EN\.md/);
  assert.match(read("docs/releases/RELEASE_NOTES_2.3.0_FA.md"), /Manifest نسخه ۲\.۳\.۰ اکنون `released` است/);
  const backlog = read("docs/roadmap/BACKLOG_FA.md");
  assert.match(backlog, /- \[x\] فاز ۱۵۳:/);
});

test("current release audit passes and historical Phase 153 remains in npm test", () => {
  assert.deepEqual(collectReleaseAuditFailures(), []);
  assert.match(packageJson.scripts.test, /tests\/phase153-release-2\.3\.0-final\.test\.ts/);
});
