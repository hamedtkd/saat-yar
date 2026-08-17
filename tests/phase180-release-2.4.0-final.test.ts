import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { collectReleaseAuditFailures } from "../scripts/release-audit.mjs";

const read = (path: string) => readFileSync(path, "utf8");
const manifest = JSON.parse(read("docs/releases/2.4.0.json")) as Record<string, unknown> & {
  version: string; candidateDate: string; releaseDate: string; status: string; dataSchemaVersion: number; tag: string;
  verifiedBaselineCommitPrefix: string; verifiedBaselineTestCount: number;
  verifiedCandidateCommitPrefix: string; verifiedCandidateTestCount: number; verifiedMainMergeCommitPrefix: string;
  expectedFinalTestCount: number; releaseEvidence: Record<string, unknown>; rollout: Record<string, unknown>;
};
const packageJson = JSON.parse(read("package.json")) as { scripts: Record<string, string> };

test("2.4.0 final manifest records candidate main merge and 770-test contract", () => {
  assert.equal(manifest.version, "2.4.0");
  assert.equal(manifest.candidateDate, "2026-08-11");
  assert.equal(manifest.releaseDate, "2026-08-12");
  assert.equal(manifest.status, "released");
  assert.equal(manifest.dataSchemaVersion, 17);
  assert.equal(manifest.verifiedCandidateCommitPrefix, "1cabdb4");
  assert.equal(manifest.verifiedCandidateTestCount, 764);
  assert.equal(manifest.verifiedMainMergeCommitPrefix, "7627e99");
  assert.equal(manifest.expectedFinalTestCount, 770);
  assert.equal(manifest.tag, "v2.4.0");
});

test("2.4.0 preserves Phase 178 evidence and avoids a self-referential release commit", () => {
  assert.equal(manifest.verifiedBaselineCommitPrefix, "887158c");
  assert.equal(manifest.verifiedBaselineTestCount, 758);
  assert.equal(manifest.releaseEvidence.phase179CandidateCommitPrefix, "1cabdb4");
  assert.equal(manifest.releaseEvidence.phase179CandidateTestCount, 764);
  assert.equal(manifest.releaseEvidence.controlledMainMergeCommitPrefix, "7627e99");
  assert.equal(Object.prototype.hasOwnProperty.call(manifest, "releaseCommit"), false);
});

test("Phase 180 rollout requires production audit before annotated tag", () => {
  assert.equal(manifest.rollout.branch, "main");
  assert.equal(manifest.rollout.mainMerge, "verified");
  assert.equal(manifest.rollout.mainMergeCommitPrefix, "7627e99");
  assert.equal(manifest.rollout.productionAudit, "required-before-tag");
  assert.equal(manifest.rollout.annotatedTag, "required-after-production-audit");
  assert.match(read("docs/phases/PHASE_180_NOTES_FA.md"), /git tag -a v2\.4\.0/);
});

test("release docs and roadmap now describe 2.4.0 as final stable release", () => {
  assert.match(read("docs/releases/RELEASE_NOTES_2.4.0_FA.md"), /تاریخ Final Release/);
  assert.match(read("docs/releases/RELEASE_NOTES_2.4.0_EN.md"), /Final release date/);
  assert.match(read("RELEASE_CHECKLIST_FA.md"), /# چک‌لیست Final Release ساعت‌یار 2\.4\.0/);
  assert.equal(manifest.status, "released");
  assert.equal(manifest.tag, "v2.4.0");
  assert.match(read("docs/roadmap/BACKLOG_FA.md"), /- \[x\] فاز ۱۸۰:/);
});

test("Phase 180 preparation is pinned to the verified 7627e99 dev baseline", () => {
  const prepare = read("scripts/prepare-release-2.4.0.mjs");
  assert.match(prepare, /verifiedMainMergeCommitPrefix/);
  assert.match(prepare, /branch !== "dev"/);
  assert.match(prepare, /Phase 180 baseline mismatch/);
  assert.equal(packageJson.scripts["release:prepare:2.4.0"], "node scripts/prepare-release-2.4.0.mjs");
});

test("active release audit passes and Phase 180 remains wired in the full test gate", () => {
  assert.deepEqual(collectReleaseAuditFailures(), []);
  assert.match(packageJson.scripts.test, /tests\/phase180-release-2\.4\.0-final\.test\.ts/);
  const historical = JSON.parse(read("docs/releases/2.3.2.json")) as { status: string; tag: string; expectedFinalTestCount: number };
  assert.equal(historical.status, "released");
  assert.equal(historical.tag, "v2.3.2");
  assert.equal(historical.expectedFinalTestCount, 639);
});
