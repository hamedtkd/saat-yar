import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const token = "__PHASE164_BASELINE__";
const manifestPath = resolve(root, "docs/releases/2.3.2.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const prepared = manifest.verifiedBaselineCommitPrefix;
const existingIsCommit = /^[0-9a-f]{7,40}$/.test(prepared ?? "") && prepared !== "0000000";
const baseline = existingIsCommit
  ? prepared
  : process.env.SAATYAR_RELEASE_BASELINE?.trim() || execFileSync("git", ["rev-parse", "--short=7", "HEAD"], { cwd: root, encoding: "utf8" }).trim();

if (!/^[0-9a-f]{7,40}$/.test(baseline) || baseline === "0000000") {
  throw new Error(`Invalid release baseline commit prefix: ${baseline}`);
}

const targets = [
  "docs/releases/2.3.2.json",
  "docs/phases/PHASE_165_NOTES_FA.md",
  "RELEASE_CHECKLIST_FA.md",
  "docs/roadmap/BACKLOG_FA.md",
];

for (const relative of targets) {
  const path = resolve(root, relative);
  const source = readFileSync(path, "utf8");
  const current = relative.endsWith(".json")
    ? source.replace(/"verifiedBaselineCommitPrefix":\s*"(?:__PHASE164_BASELINE__|[0-9a-f]{7,40})"/, `"verifiedBaselineCommitPrefix": "${baseline}"`)
    : source.replaceAll(token, baseline);
  writeFileSync(path, current);
}

console.log(existingIsCommit
  ? `Saatyar 2.3.2 baseline already prepared: ${baseline}`
  : `Saatyar 2.3.2 baseline captured from HEAD: ${baseline}`);
