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

  requireCondition(packageJson.version === ACTIVE_RELEASE_VERSION, "package.json is not on the active 2.4.0 release candidate.", failures);
  requireCondition(packageJson.version === manifest.version, "package.json version does not match the active release manifest.", failures);
  requireCondition(packageLock.version === manifest.version, "package-lock.json root version does not match the active release manifest.", failures);
  requireCondition(packageLock.packages?.[""]?.version === manifest.version, "package-lock.json package version does not match the active release manifest.", failures);
  requireCondition(packageJson.dependencies?.["framer-motion"] === "^12.42.2", "Phase 179 R6 must pin framer-motion ^12.42.2 for the flip clock.", failures);
  requireCondition(packageLock.packages?.["node_modules/framer-motion"]?.version === "12.42.2", "package-lock.json must pin framer-motion 12.42.2.", failures);
  requireCondition(packageJson.engines?.node === manifest.nodeEngine, "Node engine does not match the release manifest.", failures);
  requireCondition(APP_DATA_SCHEMA_VERSION === manifest.dataSchemaVersion, "Current AppData schema must exactly match the active release manifest schema.", failures);
  requireCondition(manifest.status === "release-candidate", "2.4.0 must remain a release-candidate during Phase 179.", failures);
  requireCondition(manifest.tag === "v2.4.0", "2.4.0 candidate must reserve the v2.4.0 tag name.", failures);
  requireCondition(manifest.releaseCommit === null, "2.4.0 candidate must not claim a final release commit.", failures);
  requireCondition(manifest.verifiedBaselineCommitPrefix === "887158c", "2.4.0 must preserve the verified Phase 178 baseline commit 887158c.", failures);
  requireCondition(manifest.verifiedBaselineTestCount === 758, "2.4.0 must preserve the 758-test Phase 178 baseline.", failures);
  requireCondition(manifest.expectedCandidateTestCount === 764, "2.4.0 Phase 179 candidate gate must expect 764 tests.", failures);
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

  const rollout = manifest.rollout ?? {};
  requireCondition(rollout.branch === "dev", "2.4.0 candidate rollout must remain on dev during Phase 179.", failures);
  requireCondition(rollout.mainMerge === "pending", "Phase 179 must not claim the main merge is complete.", failures);
  requireCondition(rollout.productionAudit === "pending", "Phase 179 must not claim a final 2.4.0 production audit.", failures);
  requireCondition(rollout.annotatedTag === "pending", "Phase 179 must not claim the annotated v2.4.0 tag exists.", failures);

  const requiredFiles = [
    RELEASE_MANIFEST_PATH, manifest.releaseNotes?.fa, manifest.releaseNotes?.en,
    "docs/releases/2.3.2.json", "docs/releases/2.3.1.json", "docs/releases/2.3.0.json",
    "docs/releases/2.2.0.json", "docs/releases/2.1.0.json",
    "RELEASE_CHECKLIST_FA.md", "CHANGELOG.md", "README.md", "README_FA.md", "README_EN.md",
    "docs/README.md", "docs/phases/PHASE_179_NOTES_FA.md", "docs/phases/PHASE_178_NOTES_FA.md",
    "docs/assets/README.md", "scripts/prepare-release-2.4.0.mjs",
  ].filter(Boolean);
  for (const path of requiredFiles) requireCondition(existsSync(resolve(ROOT, path)), `Required release file is missing: ${path}`, failures);

  requireCondition(includesLine("CHANGELOG.md", "## [2.4.0] - 2026-08-11"), "CHANGELOG.md is missing the 2.4.0 candidate release heading.", failures);
  requireCondition(includesLine("RELEASE_CHECKLIST_FA.md", "# چک‌لیست Release Candidate ساعت‌یار 2.4.0"), "Release checklist version/status is stale.", failures);
  requireCondition(readText("README_FA.md").includes(manifest.releaseNotes.fa), "Persian README does not link to Persian 2.4.0 candidate notes.", failures);
  requireCondition(readText("README.md").includes(manifest.releaseNotes.en), "Canonical English README does not link to English 2.4.0 candidate notes.", failures);
  requireCondition(readText("README_EN.md").includes("./README.md"), "Legacy README_EN.md must keep pointing to canonical README.md.", failures);
  requireCondition(readText("docs/README.md").includes("./releases/2.4.0.json"), "Docs index does not link to the active 2.4.0 candidate manifest.", failures);

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

  requireCondition(packageJson.scripts?.["release:prepare:2.4.0"] === "node scripts/prepare-release-2.4.0.mjs", "2.4.0 candidate baseline verification command is missing or stale.", failures);
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

  const declaredTests = new Set(packageJson.scripts?.test?.match(/tests\/[A-Za-z0-9_.-]+\.test\.ts/g) ?? []);
  const discoveredTests = readdirSync(resolve(ROOT, "tests")).filter((name) => name.endsWith(".test.ts")).map((name) => `tests/${name}`);
  for (const testPath of discoveredTests) requireCondition(declaredTests.has(testPath), `Test file is not included in npm test: ${testPath}`, failures);

  const releaseBacklog = sectionLines("docs/roadmap/BACKLOG_FA.md", "## آمادگی انتشار ۲.۴.۰");
  requireCondition(releaseBacklog.length > 0, "2.4.0 release-candidate backlog section is missing.", failures);
  const backlogText = releaseBacklog.join("\n");
  requireCondition(backlogText.includes("- [x] فاز ۱۷۹:"), "Phase 179 must be marked complete in the 2.4.0 candidate backlog.", failures);
  requireCondition(backlogText.includes("- [ ] فاز ۱۸۰:"), "Phase 180 must remain open until final rollout.", failures);
  requireCondition(backlogText.includes("887158c"), "2.4.0 backlog must preserve the verified Phase 178 baseline commit.", failures);
  requireCondition(backlogText.includes("۷۵۸/۷۵۸"), "2.4.0 backlog must preserve the 758-test baseline.", failures);
  requireCondition(backlogText.includes("۷۶۴/۷۶۴"), "2.4.0 backlog must declare the 764-test candidate gate.", failures);
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
  console.log(`Saatyar ${manifest.version} release candidate audit passed.`);
  console.log(`Current AppData schema: v${APP_DATA_SCHEMA_VERSION}`);
  console.log(`Candidate status: ${manifest.status}`);
  console.log(`Verified Phase 178 baseline: ${manifest.verifiedBaselineCommitPrefix}`);
  console.log(`Verified baseline test count: ${manifest.verifiedBaselineTestCount}`);
  console.log(`Expected candidate test count: ${manifest.expectedCandidateTestCount}`);
  console.log(`Phase 180 finalization target: ${manifest.expectedFinalTestCount}`);
  return true;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runReleaseAudit();
