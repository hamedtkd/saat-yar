import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(readFileSync(resolve(root, "docs/releases/2.6.0.json"), "utf8"));
const expected = manifest.verifiedCandidateCommitPrefix;
const head = execFileSync("git", ["rev-parse", "--short=7", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const branch = execFileSync("git", ["branch", "--show-current"], { cwd: root, encoding: "utf8" }).trim();

if (branch !== "dev") {
  throw new Error(`Saatyar 2.6.0 Phase 202 finalization must be prepared on dev; current branch is ${branch || "detached HEAD"}.`);
}
if (head !== expected) {
  throw new Error(`Saatyar 2.6.0 Phase 202 baseline mismatch: expected verified candidate ${expected}, current HEAD ${head}.`);
}

console.log(`Saatyar 2.6.0 Phase 202 candidate baseline verified on dev: ${head}`);
console.log(`Verified Phase 201 candidate: ${manifest.verifiedCandidateCommitPrefix} (${manifest.verifiedCandidateTestCount} tests)`);
console.log(`Final Node test target: ${manifest.expectedFinalTestCount}`);
console.log("Release order: finalization commit on dev -> controlled main merge -> Vercel production deploy -> npm run audit:production -> annotated v2.6.0 tag.");
