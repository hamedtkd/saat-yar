import assert from "node:assert/strict";
import test from "node:test";
import { collectFinal250AuditFailures, getRelease250Snapshot } from "../scripts/release-audit.mjs";

const snapshot = getRelease250Snapshot();

test("2.5.0 final manifest records the verified Phase 193 candidate and 880-test target", () => {
  assert.equal(snapshot.version, "2.5.0");
  assert.equal(snapshot.status, "released");
  assert.equal(snapshot.releaseDate, "2026-08-17");
  assert.equal(snapshot.candidateCommit, "d81e094");
  assert.equal(snapshot.candidateTests, 874);
  assert.equal(snapshot.finalTargetTests, 880);
});

test("2.5.0 finalization preserves schema v20 and the v17 to v20 migration chain", () => {
  assert.equal(snapshot.dataSchemaVersion, 20);
  assert.equal(snapshot.releasedSchemaBaseline, 17);
  assert.deepEqual(snapshot.migrationChain, [18, 19, 20]);
});

test("Phase 194 requires main deployment production audit before the annotated tag", () => {
  assert.deepEqual(snapshot.rollout, {
    branch: "main",
    mainMerge: "required-before-tag",
    productionAudit: "required-before-tag",
    annotatedTag: "required-after-production-audit",
  });
});

test("final release remains version-aligned without a self-referential release commit", () => {
  assert.equal(snapshot.packageVersion, "2.5.0");
  assert.equal(snapshot.lockVersion, "2.5.0");
  assert.equal(snapshot.lockRootVersion, "2.5.0");
  assert.equal(snapshot.hasReleaseCommit, false);
});

test("Phase 194 finalization stays pinned to candidate d81e094", () => {
  assert.equal(snapshot.candidatePhase, 193);
  assert.equal(snapshot.candidateCommit, "d81e094");
  assert.equal(snapshot.candidateTests, 874);
  assert.equal(snapshot.prepareCommand, "node scripts/prepare-release-2.5.0.mjs");
});

test("2.5.0 final release audit passes before controlled rollout", () => {
  assert.deepEqual(collectFinal250AuditFailures(), []);
});
