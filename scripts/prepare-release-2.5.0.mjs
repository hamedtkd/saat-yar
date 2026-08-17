import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(readFileSync(resolve(root, "docs/releases/2.5.0.json"), "utf8"));
const expected = manifest.verifiedCandidateCommitPrefix;
const head = execFileSync("git", ["rev-parse", "--short=7", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const branch = execFileSync("git", ["branch", "--show-current"], { cwd: root, encoding: "utf8" }).trim();

if (branch !== "dev") throw new Error(`Saatyar 2.5.0 finalization must be prepared on dev; current branch is ${branch || "detached HEAD"}.`);
if (head !== expected) throw new Error(`Saatyar 2.5.0 Phase 194 baseline mismatch: expected ${expected}, current HEAD ${head}.`);

console.log(`Saatyar 2.5.0 Phase 194 baseline verified on dev: ${head}`);
console.log(`Verified Phase 193 candidate: ${manifest.verifiedCandidateCommitPrefix} (${manifest.verifiedCandidateTestCount} tests)`);
console.log(`Final gate target: ${manifest.expectedFinalTestCount}`);
console.log("Release order: controlled main merge -> production audit -> annotated v2.5.0 tag");
