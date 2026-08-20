import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(readFileSync(resolve(root, "docs/releases/2.6.1.json"), "utf8"));
const expected = manifest.verifiedBaselineCommitPrefix;
const head = execFileSync("git", ["rev-parse", "--short=7", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const branch = execFileSync("git", ["branch", "--show-current"], { cwd: root, encoding: "utf8" }).trim();

if (branch !== "dev") throw new Error(`Saatyar 2.6.1 candidate must be prepared on dev; current branch is ${branch || "detached HEAD"}.`);
if (head !== expected) throw new Error(`Saatyar 2.6.1 Phase 203 baseline mismatch: expected ${expected}, current HEAD ${head}.`);

console.log(`Saatyar 2.6.1 Phase 203 baseline verified on dev: ${head}`);
console.log(`Verified released 2.6.0 baseline: ${manifest.verifiedBaselineCommitPrefix} (${manifest.verifiedBaselineTestCount} tests)`);
console.log(`Candidate Node test target: ${manifest.expectedCandidateTestCount}`);
console.log("Phase 203 boundary: migrate analytics transport only; AppData stays v21 and no work-content telemetry is added.");
