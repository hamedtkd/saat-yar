import assert from "node:assert/strict";
import test from "node:test";

import { collectReleaseAuditFailures, getRelease250Snapshot } from "../scripts/release-audit.mjs";

const snapshot = getRelease250Snapshot();

test("historical 2.4.0 release evidence remains valid after 2.5.0 finalization starts", () => {
  assert.deepEqual(collectReleaseAuditFailures(), []);
  assert.deepEqual(snapshot.historical240, { version: "2.4.0", status: "released", schema: 17, tag: "v2.4.0" });
});

test("Phase 193 candidate evidence remains pinned to the verified Phase 192 baseline", () => {
  assert.equal(snapshot.packageVersion, "2.5.0");
  assert.equal(snapshot.lockVersion, "2.5.0");
  assert.equal(snapshot.lockRootVersion, "2.5.0");
  assert.equal(snapshot.candidateDate, "2026-08-17");
  assert.equal(snapshot.baselinePhase, 192);
  assert.equal(snapshot.baselineCommit, "0c4c22e");
  assert.equal(snapshot.baselineTests, 870);
  assert.equal(snapshot.candidatePhase, 193);
  assert.equal(snapshot.candidateCommit, "d81e094");
  assert.equal(snapshot.candidateTests, 874);
});

test("2.5.0 preserves the candidate migration boundary from released v17 to v20", () => {
  assert.equal(snapshot.releasedSchemaBaseline, 17);
  assert.equal(snapshot.dataSchemaVersion, 20);
  assert.deepEqual(snapshot.migrationChain, [18, 19, 20]);
  assert.equal(snapshot.directDependencyCount, 33);
});

test("Phase 193 remains historical while Phase 194 owns final rollout state", () => {
  assert.equal(snapshot.hasReleaseCommit, false);
  assert.equal(snapshot.prepareCommand, "node scripts/prepare-release-2.5.0.mjs");
  assert.equal(snapshot.candidateCommit, "d81e094");
  assert.equal(snapshot.candidateTests, 874);
});
