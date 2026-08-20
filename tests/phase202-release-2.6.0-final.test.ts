import assert from "node:assert/strict";
import test from "node:test";

import {
  collectFinal260AuditFailures,
  getRelease260Snapshot,
} from "../scripts/release-audit.mjs";
import {
  assertProductionManifestContract,
  assertProductionSecurityHeaders,
  assertRevalidationHeader,
} from "../scripts/remote-production-audit.mjs";

const snapshot = getRelease260Snapshot();

test("2.6.0 final manifest records the verified Phase 201 candidate and 970-test target", () => {
  assert.equal(snapshot.version, "2.6.0");
  assert.equal(snapshot.status, "released");
  assert.equal(snapshot.releaseDate, "2026-08-20");
  assert.equal(snapshot.candidateCommit, "3e5bcbf");
  assert.equal(snapshot.candidateTests, 964);
  assert.equal(snapshot.finalPhase, 202);
  assert.equal(snapshot.finalTargetTests, 970);
});

test("2.6.0 finalization preserves schema v21 and the released v20 migration boundary", () => {
  assert.equal(snapshot.dataSchemaVersion, 21);
  assert.equal(snapshot.releasedSchemaBaseline, 20);
  assert.deepEqual(snapshot.migrationChain, [21]);
  assert.equal(snapshot.directDependencyCount, 33);
});

test("Phase 202 requires main deployment and production audit before the annotated tag", () => {
  assert.deepEqual(snapshot.rollout, {
    branch: "main",
    mainMerge: "required-before-tag",
    productionAudit: "required-before-tag",
    annotatedTag: "required-after-production-audit",
  });
  assert.equal(snapshot.productionAuditCommand, "node scripts/remote-production-audit.mjs");
  assert.equal(snapshot.hasReleaseCommit, false);
});

test("Phase 202 final gate stays pinned to the verified candidate baseline", () => {
  assert.equal(snapshot.finalPrepareCommand, "node scripts/prepare-release-2.6.0-final.mjs");
  assert.equal(snapshot.finalCommand, "npm run release:finalize:2.6.0 && npm run check:release:full");
  assert.equal(snapshot.candidateCommit, "3e5bcbf");
  assert.equal(snapshot.candidateTests, 964);
});

test("remote production audit follows the current bilingual PWA and hardened header contract", () => {
  assert.doesNotThrow(() => assertProductionManifestContract({
    name: "Saatyar | ساعت یار",
    short_name: "Saatyar",
    dir: "auto",
    lang: "fa",
    display: "standalone",
    start_url: "/today/",
    icons: [{}, {}, {}],
  }));
  const headers = new Headers({
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": "camera=(self), microphone=(), geolocation=()",
    "strict-transport-security": "max-age=31536000",
    "cache-control": "public, max-age=0, must-revalidate",
  });
  assert.doesNotThrow(() => assertProductionSecurityHeaders(headers));
  assert.doesNotThrow(() => assertRevalidationHeader("PWA manifest", headers));
});

test("2.6.0 final release audit passes before controlled production rollout", () => {
  assert.deepEqual(collectFinal260AuditFailures(), []);
});
