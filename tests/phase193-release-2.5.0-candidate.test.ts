import assert from "node:assert/strict";
import test from "node:test";

import {
  collectCandidate250AuditFailures,
  collectReleaseAuditFailures,
  getCandidate250AuditSnapshot,
} from "../scripts/release-audit.mjs";

const snapshot = getCandidate250AuditSnapshot();

test("historical 2.4.0 release evidence remains valid while 2.5.0 becomes active candidate", () => {
  assert.deepEqual(collectReleaseAuditFailures(), []);
  assert.deepEqual(snapshot.historical240, {
    version: "2.4.0",
    status: "released",
    schema: 17,
    tag: "v2.4.0",
  });
});

test("2.5.0 candidate is version-aligned and pinned to the verified Phase 192 baseline", () => {
  assert.equal(snapshot.packageVersion, "2.5.0");
  assert.equal(snapshot.lockVersion, "2.5.0");
  assert.equal(snapshot.lockRootVersion, "2.5.0");
  assert.equal(snapshot.version, "2.5.0");
  assert.equal(snapshot.status, "release-candidate");
  assert.equal(snapshot.candidateDate, "2026-08-17");
  assert.equal(snapshot.baselinePhase, 192);
  assert.equal(snapshot.baselineCommit, "0c4c22e");
  assert.equal(snapshot.baselineTests, 870);
  assert.equal(snapshot.candidateTargetTests, 874);
});

test("2.5.0 candidate audits the released v17 to development v20 migration boundary", () => {
  assert.equal(snapshot.releasedSchemaBaseline, 17);
  assert.equal(snapshot.dataSchemaVersion, 20);
  assert.deepEqual(snapshot.migrationChain, [18, 19, 20]);
  assert.equal(snapshot.directDependencyCount, 33);
});

test("Phase 193 keeps final rollout pending and passes the candidate release audit", () => {
  assert.equal(snapshot.releaseDate, null);
  assert.equal(snapshot.hasReleaseCommit, false);
  assert.deepEqual(snapshot.rollout, {
    branch: "dev",
    mainMerge: "pending",
    productionAudit: "pending-after-main-deploy",
    annotatedTag: "pending-after-production-audit",
  });
  assert.equal(snapshot.prepareCommand, "node scripts/prepare-release-2.5.0.mjs");
  assert.deepEqual(collectCandidate250AuditFailures(), []);
});
