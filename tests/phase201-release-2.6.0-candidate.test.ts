import assert from "node:assert/strict";
import test from "node:test";

import {
  collectCandidate260AuditFailures,
  collectFinal250AuditFailures,
  getRelease260Snapshot,
} from "../scripts/release-audit.mjs";

const snapshot = getRelease260Snapshot();

test("historical Phase 201 candidate evidence preserves the verified Phase 200 baseline", () => {
  assert.equal(snapshot.version, "2.6.0");
  assert.equal(snapshot.candidateDate, "2026-08-20");
  assert.equal(snapshot.baselinePhase, 200);
  assert.equal(snapshot.baselineCommit, "15f5af8");
  assert.equal(snapshot.baselineTests, 958);
  assert.equal(snapshot.candidatePhase, 201);
  assert.equal(snapshot.candidateTargetTests, 964);
});

test("historical Phase 201 candidate is pinned to commit 3e5bcbf and 964 tests", () => {
  assert.equal(snapshot.candidateCommit, "3e5bcbf");
  assert.equal(snapshot.candidateTests, 964);
  assert.equal(snapshot.packageVersion, "2.6.0");
  assert.equal(snapshot.lockVersion, "2.6.0");
  assert.equal(snapshot.lockRootVersion, "2.6.0");
});

test("2.6.0 preserves the Phase 201 migration boundary from released v20 to v21", () => {
  assert.equal(snapshot.historical250.version, "2.5.0");
  assert.equal(snapshot.historical250.status, "released");
  assert.equal(snapshot.historical250.schema, 20);
  assert.equal(snapshot.historical250.tag, "v2.5.0");
  assert.equal(snapshot.releasedSchemaBaseline, 20);
  assert.equal(snapshot.dataSchemaVersion, 21);
  assert.deepEqual(snapshot.migrationChain, [21]);
});

test("Phase 201 remains historical while Phase 202 owns final rollout state", () => {
  assert.equal(snapshot.finalPhase, 202);
  assert.equal(snapshot.hasReleaseCommit, false);
  assert.equal(snapshot.candidateCommit, "3e5bcbf");
  assert.equal(snapshot.candidateTests, 964);
});

test("historical Phase 201 keeps its candidate preparation and hardening commands", () => {
  assert.equal(snapshot.prepareCommand, "node scripts/prepare-release-2.6.0.mjs");
  assert.equal(snapshot.candidateCommand, "npm run release:prepare:2.6.0 && npm run check:release:full");
  assert.equal(snapshot.hardeningCommand, "node scripts/release-hardening-audit.mjs");
  assert.equal(snapshot.directDependencyCount, 33);
});

test("historical candidate and released 2.5.0 audits remain valid during Phase 202", () => {
  assert.deepEqual(collectFinal250AuditFailures(), []);
  assert.deepEqual(collectCandidate260AuditFailures(), []);
});
