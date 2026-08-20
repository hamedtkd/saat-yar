import assert from "node:assert/strict";
import test from "node:test";

import {
  collectCandidate260AuditFailures,
  collectFinal250AuditFailures,
  getRelease260Snapshot,
} from "../scripts/release-audit.mjs";

const snapshot = getRelease260Snapshot();

test("Phase 201 packages 2.6.0 from the verified Phase 200 baseline", () => {
  assert.equal(snapshot.version, "2.6.0");
  assert.equal(snapshot.status, "release-candidate");
  assert.equal(snapshot.candidateDate, "2026-08-20");
  assert.equal(snapshot.baselinePhase, 200);
  assert.equal(snapshot.baselineCommit, "15f5af8");
  assert.equal(snapshot.baselineTests, 958);
  assert.equal(snapshot.candidatePhase, 201);
  assert.equal(snapshot.candidateTargetTests, 964);
});

test("2.6.0 candidate version is aligned across package and root lock metadata", () => {
  assert.equal(snapshot.packageVersion, "2.6.0");
  assert.equal(snapshot.lockVersion, "2.6.0");
  assert.equal(snapshot.lockRootVersion, "2.6.0");
  assert.equal(snapshot.directDependencyCount, 33);
});

test("2.6.0 advances only the released v20 data boundary to v21", () => {
  assert.equal(snapshot.historical250.version, "2.5.0");
  assert.equal(snapshot.historical250.status, "released");
  assert.equal(snapshot.historical250.schema, 20);
  assert.equal(snapshot.historical250.tag, "v2.5.0");
  assert.equal(snapshot.releasedSchemaBaseline, 20);
  assert.equal(snapshot.dataSchemaVersion, 21);
  assert.deepEqual(snapshot.migrationChain, [21]);
});

test("Phase 201 cannot claim a final release commit, production rollout, or tag", () => {
  assert.equal(snapshot.releaseDate, null);
  assert.equal(snapshot.candidateCommit, null);
  assert.deepEqual(snapshot.rollout, {
    branch: "dev",
    mainMerge: "phase-202-only",
    productionAudit: "phase-202-only",
    annotatedTag: "phase-202-only",
  });
});

test("Phase 201 keeps the full hardening gate and baseline preparation commands explicit", () => {
  assert.equal(snapshot.prepareCommand, "node scripts/prepare-release-2.6.0.mjs");
  assert.equal(snapshot.candidateCommand, "npm run release:prepare:2.6.0 && npm run check:release:full");
  assert.equal(snapshot.hardeningCommand, "node scripts/release-hardening-audit.mjs");
});

test("2.6.0 candidate audit passes while historical 2.5.0 release evidence stays valid", () => {
  assert.deepEqual(collectFinal250AuditFailures(), []);
  assert.deepEqual(collectCandidate260AuditFailures(), []);
});
