import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ACTIVE_RELEASE_VERSION = "2.4.0";
const RELEASE_MANIFEST_PATH = `docs/releases/${ACTIVE_RELEASE_VERSION}.json`;
const REQUIRED_MEDIA = [
  "docs/assets/screenshots/today-light-desktop.png",
  "docs/assets/screenshots/today-dark-desktop.png",
  "docs/assets/screenshots/today-mobile.png",
  "docs/assets/screenshots/reports-light.png",
  "docs/assets/screenshots/reports-dark.png",
  "docs/assets/media/onboarding.gif",
];

function readText(path) { return readFileSync(resolve(ROOT, path), "utf8"); }
function readJson(path) { return JSON.parse(readText(path)); }
function lines(path) { return readText(path).split(/\r?\n/); }
function requireCondition(condition, message, failures) { if (!condition) failures.push(message); }
function includesLine(path, expected) { return lines(path).some((line) => line.trim() === expected); }
function sectionLines(path, heading) {
  const source = lines(path);
  const start = source.findIndex((line) => line.trim() === heading);
  if (start < 0) return [];
  const body = [];
  for (const line of source.slice(start + 1)) {
    if (/^##\s+/.test(line)) break;
    body.push(line);
  }
  return body;
}

export function collectReleaseAuditFailures() {
  const failures = [];
  const packageJson = readJson("package.json");
  const packageLock = readJson("package-lock.json");
  const manifest = readJson(RELEASE_MANIFEST_PATH);

  requireCondition(packageJson.version === ACTIVE_RELEASE_VERSION, "package.json is not on the active 2.4.0 release.", failures);
  requireCondition(packageJson.version === manifest.version, "package.json version does not match the active release manifest.", failures);
  requireCondition(packageLock.version === manifest.version, "package-lock.json root version does not match the active release manifest.", failures);
  requireCondition(packageLock.packages?.[""]?.version === manifest.version, "package-lock.json package version does not match the active release manifest.", failures);
  requireCondition(packageJson.dependencies?.["framer-motion"] === "^12.42.2", "Phase 179 R6 must pin framer-motion ^12.42.2 for the flip clock.", failures);
  requireCondition(packageLock.packages?.["node_modules/framer-motion"]?.version === "12.42.2", "package-lock.json must pin framer-motion 12.42.2.", failures);
  requireCondition(packageJson.engines?.node === manifest.nodeEngine, "Node engine does not match the release manifest.", failures);
  requireCondition(manifest.dataSchemaVersion === 17, "Released 2.4.0 manifest schema must remain v17.", failures);
  requireCondition(APP_DATA_SCHEMA_VERSION >= manifest.dataSchemaVersion, "Current development schema cannot be older than the released 2.4.0 schema.", failures);
  requireCondition(manifest.status === "released", "2.4.0 must be released during Phase 180 finalization.", failures);
  requireCondition(manifest.tag === "v2.4.0", "2.4.0 final manifest must reserve the v2.4.0 tag name.", failures);
  requireCondition(!Object.prototype.hasOwnProperty.call(manifest, "releaseCommit"), "2.4.0 final manifest must avoid a self-referential releaseCommit field.", failures);
  requireCondition(manifest.verifiedBaselineCommitPrefix === "887158c", "2.4.0 must preserve the verified Phase 178 baseline commit 887158c.", failures);
  requireCondition(manifest.verifiedBaselineTestCount === 758, "2.4.0 must preserve the 758-test Phase 178 baseline.", failures);
  requireCondition(manifest.verifiedCandidateCommitPrefix === "1cabdb4", "2.4.0 must record the verified Phase 179 candidate commit 1cabdb4.", failures);
  requireCondition(manifest.verifiedCandidateTestCount === 764, "2.4.0 must record the verified 764-test Phase 179 candidate gate.", failures);
  requireCondition(manifest.verifiedMainMergeCommitPrefix === "7627e99", "2.4.0 must record the verified initial main merge 7627e99.", failures);
  requireCondition(manifest.expectedFinalTestCount === 770, "2.4.0 Phase 180 final gate target must remain 770 tests.", failures);

  const evidence = manifest.releaseEvidence ?? {};
  requireCondition(evidence.baselinePhase === 178, "2.4.0 must identify Phase 178 as its verified baseline.", failures);
  requireCondition(evidence.phase178FinalTestCount === 758, "2.4.0 must preserve the Phase 178 758-test evidence.", failures);
  requireCondition(evidence.productionBrowserSmoke === "passed", "2.4.0 must preserve passing production browser evidence.", failures);
  requireCondition(evidence.freelancerBrowserSmoke === "passed", "2.4.0 must preserve passing freelancer browser evidence.", failures);
  requireCondition(evidence.employeeBrowserSmoke === "passed", "2.4.0 must preserve passing employee browser evidence.", failures);
  requireCondition(evidence.pairingBrowserSmoke === "passed", "2.4.0 must preserve passing pairing browser evidence.", failures);
  requireCondition(evidence.pairingEncryptedChunks === 4, "2.4.0 must preserve the four encrypted pairing chunks.", failures);
  requireCondition(evidence.vercelStaticExportAudit === "passed", "2.4.0 must preserve the passing Vercel static-export audit.", failures);
  requireCondition(evidence.i18nClosureAudit === "passed", "2.4.0 must preserve the passing i18n closure audit.", failures);
  requireCondition(evidence.staticRoutes === 22, "2.4.0 must preserve the verified 22-route static build.", failures);
  requireCondition(evidence.pwaPrecacheBuildAssets === 44, "2.4.0 must preserve the verified 44-asset PWA precache evidence.", failures);
  requireCondition(evidence.candidatePhase === 179, "2.4.0 must identify Phase 179 as the verified candidate phase.", failures);
  requireCondition(evidence.phase179CandidateCommitPrefix === "1cabdb4", "2.4.0 release evidence must preserve candidate commit 1cabdb4.", failures);
  requireCondition(evidence.phase179CandidateTestCount === 764, "2.4.0 release evidence must preserve the 764-test candidate gate.", failures);
  requireCondition(evidence.controlledMainMergeCommitPrefix === "7627e99", "2.4.0 release evidence must preserve the initial main merge 7627e99.", failures);

  const rollout = manifest.rollout ?? {};
  requireCondition(rollout.branch === "main", "2.4.0 final rollout branch must be main.", failures);
  requireCondition(rollout.mainMerge === "verified", "Phase 180 must record the initial controlled main merge as verified.", failures);
  requireCondition(rollout.mainMergeCommitPrefix === "7627e99", "Phase 180 rollout must preserve the verified main merge prefix 7627e99.", failures);
  requireCondition(rollout.productionAudit === "required-before-tag", "Phase 180 must require a post-deploy production audit before tagging.", failures);
  requireCondition(rollout.annotatedTag === "required-after-production-audit", "Phase 180 must require the annotated tag only after the production audit.", failures);

  const requiredFiles = [
    RELEASE_MANIFEST_PATH, manifest.releaseNotes?.fa, manifest.releaseNotes?.en,
    "docs/releases/2.3.2.json", "docs/releases/2.3.1.json", "docs/releases/2.3.0.json",
    "docs/releases/2.2.0.json", "docs/releases/2.1.0.json",
    "RELEASE_CHECKLIST_FA.md", "CHANGELOG.md", "README.md", "README_FA.md", "README_EN.md",
    "docs/README.md", "docs/phases/PHASE_180_NOTES_FA.md", "docs/phases/PHASE_179_NOTES_FA.md", "docs/phases/PHASE_178_NOTES_FA.md",
    "docs/assets/README.md", "scripts/prepare-release-2.4.0.mjs",
  ].filter(Boolean);
  for (const path of requiredFiles) requireCondition(existsSync(resolve(ROOT, path)), `Required release file is missing: ${path}`, failures);

  requireCondition(includesLine("CHANGELOG.md", "## [2.4.0] - 2026-08-12"), "CHANGELOG.md is missing the 2.4.0 final release heading.", failures);
  requireCondition(includesLine("RELEASE_CHECKLIST_FA.md", "# چک‌لیست Final Release ساعت‌یار 2.4.0"), "Final release checklist version/status is stale.", failures);
  requireCondition(readText("README_FA.md").includes(manifest.releaseNotes.fa), "Persian README does not link to Persian 2.4.0 release notes.", failures);
  requireCondition(readText("README.md").includes(manifest.releaseNotes.en), "Canonical English README does not link to English 2.4.0 release notes.", failures);
  requireCondition(readText("README_EN.md").includes("./README.md"), "Legacy README_EN.md must keep pointing to canonical README.md.", failures);
  requireCondition(readText("docs/README.md").includes("./releases/2.4.0.json"), "Docs index does not link to the active 2.4.0 release manifest.", failures);

  const historical232 = readJson("docs/releases/2.3.2.json");
  requireCondition(historical232.version === "2.3.2", "Historical 2.3.2 manifest was mutated.", failures);
  requireCondition(historical232.status === "released", "Historical 2.3.2 release status was mutated.", failures);
  requireCondition(historical232.tag === "v2.3.2", "Historical 2.3.2 tag contract was mutated.", failures);
  requireCondition(historical232.verifiedBaselineCommitPrefix === "e3c0a03", "Historical 2.3.2 baseline evidence was mutated.", failures);
  requireCondition(historical232.expectedFinalTestCount === 639, "Historical 2.3.2 final test evidence was mutated.", failures);

  const readmeFa = readText("README_FA.md");
  const readmeEn = readText("README.md");
  for (const mediaPath of REQUIRED_MEDIA) {
    requireCondition(readmeFa.includes(mediaPath), `Persian README is missing product media reference: ${mediaPath}`, failures);
    requireCondition(readmeEn.includes(mediaPath), `English README is missing product media reference: ${mediaPath}`, failures);
  }
  const mediaContract = readText("docs/assets/README.md");
  requireCondition(mediaContract.includes("npm run media:capture"), "Media contract must document the reproducible capture command.", failures);
  requireCondition(mediaContract.includes("Fixture"), "Media contract must state that capture uses demo fixture data.", failures);

  const releaseSteps = packageJson.scripts?.["check:release"]?.split("&&").map((step) => step.trim()) ?? [];
  const expectedReleaseSteps = [
    "npm run check:quality", "npm run check:release:audit", "npm run test:browser:production:built",
    "npm run test:browser:freelancer:built", "npm run test:browser:employee:built",
  ];
  requireCondition(releaseSteps.length === expectedReleaseSteps.length, "check:release must contain exactly the five current release-gate steps.", failures);
  for (const [index, expected] of expectedReleaseSteps.entries()) requireCondition(releaseSteps[index] === expected, `check:release step ${index + 1} must be ${expected}.`, failures);

  requireCondition(packageJson.scripts?.["release:prepare:2.4.0"] === "node scripts/prepare-release-2.4.0.mjs", "2.4.0 Phase 180 baseline verification command is missing or stale.", failures);
  requireCondition(packageJson.scripts?.["check:release:audit"] === "node --experimental-strip-types scripts/release-audit.mjs", "Release audit command is missing or stale.", failures);
  requireCondition(packageJson.scripts?.["audit:i18n"] === "node scripts/audit-i18n-closure.mjs", "i18n closure audit command is missing or stale.", failures);
  requireCondition(packageJson.scripts?.["test:browser:production:built"] === "node scripts/production-browser-smoke.mjs", "Production browser gate command is missing or stale.", failures);
  requireCondition(packageJson.scripts?.["test:browser:freelancer:built"] === "node --experimental-strip-types scripts/freelancer-browser-ux-smoke.mjs", "Freelancer browser gate command is missing or stale.", failures);
  requireCondition(packageJson.scripts?.["test:browser:employee:built"] === "node --experimental-strip-types scripts/employee-browser-ux-smoke.mjs", "Employee browser gate command is missing or stale.", failures);
  requireCondition(packageJson.scripts?.["test:browser:pairing"] === "node scripts/device-pairing-browser-smoke.mjs", "Pairing browser gate command is missing or stale.", failures);
  requireCondition(packageJson.scripts?.["audit:production"] === "node scripts/remote-production-audit.mjs", "Production-domain audit command is missing or stale.", failures);
  requireCondition(packageJson.scripts?.["audit:vercel"] === "node scripts/vercel-static-export-contract.mjs", "Vercel audit command is missing or stale.", failures);

  requireCondition(manifest.qualityCommand === "npm run check:release", "Release manifest quality command is stale.", failures);
  requireCondition(manifest.browserGate === "scripts/production-browser-smoke.mjs", "Release manifest production browser gate is stale.", failures);
  requireCondition(manifest.freelancerBrowserGate === "scripts/freelancer-browser-ux-smoke.mjs", "Release manifest freelancer browser gate is stale.", failures);
  requireCondition(manifest.employeeBrowserGate === "scripts/employee-browser-ux-smoke.mjs", "Release manifest employee browser gate is stale.", failures);
  requireCondition(manifest.pairingBrowserGate === "scripts/device-pairing-browser-smoke.mjs", "Release manifest pairing browser gate is stale.", failures);
  requireCondition(manifest.pairingCommand === "npm run test:browser:pairing", "Release manifest pairing command is stale.", failures);
  requireCondition(manifest.i18nAuditCommand === "npm run audit:i18n", "Release manifest i18n audit command is stale.", failures);
  requireCondition(manifest.productionAuditCommand === "npm run audit:production", "Release manifest production audit command is stale.", failures);
  requireCondition(manifest.vercelAuditCommand === "npm run audit:vercel", "Release manifest Vercel audit command is stale.", failures);

  const testCommand = packageJson.scripts?.test ?? "";
  const declaredTests = new Set(testCommand.match(/tests\/[A-Za-z0-9_.-]+\.test\.ts/g) ?? []);
  const coversAllTests = testCommand.includes("tests/**/*.test.ts");
  const discoveredTests = readdirSync(resolve(ROOT, "tests")).filter((name) => name.endsWith(".test.ts")).map((name) => `tests/${name}`);
  for (const testPath of discoveredTests) {
    requireCondition(coversAllTests || declaredTests.has(testPath), `Test file is not included in npm test: ${testPath}`, failures);
  }

  const releaseBacklog = sectionLines("docs/roadmap/BACKLOG_FA.md", "## آمادگی انتشار ۲.۴.۰");
  requireCondition(releaseBacklog.length > 0, "2.4.0 release backlog section is missing.", failures);
  const backlogText = releaseBacklog.join("\n");
  requireCondition(backlogText.includes("- [x] فاز ۱۷۹:"), "Phase 179 must be marked complete in the 2.4.0 release backlog.", failures);
  requireCondition(backlogText.includes("- [x] فاز ۱۸۰:"), "Phase 180 finalization contract must be marked complete in the 2.4.0 release backlog.", failures);
  requireCondition(backlogText.includes("1cabdb4"), "2.4.0 backlog must preserve the verified Phase 179 candidate commit.", failures);
  requireCondition(backlogText.includes("7627e99"), "2.4.0 backlog must preserve the verified initial main merge.", failures);
  requireCondition(backlogText.includes("۷۶۴/۷۶۴"), "2.4.0 backlog must preserve the 764-test candidate gate.", failures);
  requireCondition(backlogText.includes("۷۷۰/۷۷۰"), "2.4.0 backlog must declare the 770-test finalization target.", failures);

  return failures;
}

export function runReleaseAudit() {
  const failures = collectReleaseAuditFailures();
  if (failures.length > 0) {
    console.error("Saatyar release audit failed\n");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return false;
  }
  const manifest = readJson(RELEASE_MANIFEST_PATH);
  console.log(`Saatyar ${manifest.version} final release audit passed.`);
  console.log(`Current development AppData schema: v${APP_DATA_SCHEMA_VERSION}`);
  console.log(`Released 2.4.0 AppData schema: v${manifest.dataSchemaVersion}`);
  console.log(`Release status: ${manifest.status}`);
  console.log(`Verified Phase 178 baseline: ${manifest.verifiedBaselineCommitPrefix}`);
  console.log(`Verified baseline test count: ${manifest.verifiedBaselineTestCount}`);
  console.log(`Verified Phase 179 candidate: ${manifest.verifiedCandidateCommitPrefix} (${manifest.verifiedCandidateTestCount} tests)`);
  console.log(`Verified initial main merge: ${manifest.verifiedMainMergeCommitPrefix}`);
  console.log(`Phase 180 finalization target: ${manifest.expectedFinalTestCount}`);
  return true;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runReleaseAudit();
