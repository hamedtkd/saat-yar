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

export function collectFinal250AuditFailures() {
  const failures = [];
  const packageJson = readJson("package.json");
  const manifest = readJson("docs/releases/2.5.0.json");
  const released240 = readJson("docs/releases/2.4.0.json");

  requireCondition(manifest.version === "2.5.0", "Historical 2.5.0 final manifest version was mutated.", failures);
  requireCondition(manifest.status === "released", "Historical 2.5.0 manifest must remain released.", failures);
  requireCondition(manifest.candidateDate === "2026-08-17", "Historical 2.5.0 candidate date was mutated.", failures);
  requireCondition(manifest.releaseDate === "2026-08-17", "Historical 2.5.0 release date was mutated.", failures);
  requireCondition(!Object.prototype.hasOwnProperty.call(manifest, "releaseCommit"), "Historical 2.5.0 manifest must avoid a self-referential releaseCommit field.", failures);
  requireCondition(manifest.tag === "v2.5.0", "Historical 2.5.0 annotated tag contract was mutated.", failures);
  requireCondition(manifest.dataSchemaVersion === 20, "Historical 2.5.0 schema must remain v20.", failures);
  requireCondition(manifest.releasedSchemaBaseline === 17, "Historical 2.5.0 must preserve the released 2.4.0 v17 baseline.", failures);
  requireCondition(APP_DATA_SCHEMA_VERSION >= manifest.dataSchemaVersion, "Current development AppData schema cannot be older than released 2.5.0.", failures);
  requireCondition(released240.version === "2.4.0" && released240.status === "released" && released240.dataSchemaVersion === 17, "Historical 2.4.0 release manifest must remain released on schema v17.", failures);
  requireCondition(manifest.nodeEngine === packageJson.engines?.node, "Historical 2.5.0 Node engine must remain compatible with the current package engine.", failures);
  requireCondition(manifest.verifiedBaselineCommitPrefix === "0c4c22e", "2.5.0 must preserve Phase 192 baseline 0c4c22e.", failures);
  requireCondition(manifest.verifiedBaselineTestCount === 870, "2.5.0 must preserve the 870-test Phase 192 baseline.", failures);
  requireCondition(manifest.verifiedCandidateCommitPrefix === "d81e094", "2.5.0 must preserve the verified Phase 193 candidate d81e094.", failures);
  requireCondition(manifest.verifiedCandidateTestCount === 874, "2.5.0 must preserve the 874-test Phase 193 candidate gate.", failures);
  requireCondition(manifest.expectedFinalTestCount === 880, "Historical Phase 194 final test target must remain 880.", failures);

  const evidence = manifest.releaseEvidence ?? {};
  requireCondition(evidence.baselinePhase === 192, "2.5.0 must preserve Phase 192 as its development baseline.", failures);
  requireCondition(evidence.candidatePhase === 193, "2.5.0 must preserve Phase 193 as its verified candidate.", failures);
  requireCondition(evidence.phase192BaselineCommitPrefix === "0c4c22e", "2.5.0 evidence must preserve baseline commit 0c4c22e.", failures);
  requireCondition(evidence.phase192BaselineTestCount === 870, "2.5.0 evidence must preserve 870 baseline tests.", failures);
  requireCondition(evidence.phase193CandidateCommitPrefix === "d81e094", "2.5.0 evidence must preserve candidate commit d81e094.", failures);
  requireCondition(evidence.phase193CandidateTestCount === 874, "2.5.0 evidence must preserve 874 candidate tests.", failures);
  requireCondition(JSON.stringify(evidence.migrationChain) === JSON.stringify([18, 19, 20]), "2.5.0 migration chain must remain v17 -> v18 -> v19 -> v20.", failures);
  for (const key of ["productionBrowserSmoke", "freelancerBrowserSmoke", "employeeBrowserSmoke", "pairingBrowserSmoke", "vercelStaticExportAudit", "i18nClosureAudit", "testCouplingAudit"]) {
    requireCondition(evidence[key] === "passed-on-candidate", `Historical 2.5.0 evidence ${key} was mutated.`, failures);
  }
  requireCondition(evidence.productionDomainAudit === "required-after-main-deploy", "Historical 2.5.0 production-domain audit boundary was mutated.", failures);

  const rollout = manifest.rollout ?? {};
  requireCondition(rollout.branch === "main", "Historical Phase 194 rollout target must remain main.", failures);
  requireCondition(rollout.mainMerge === "required-before-tag", "Historical Phase 194 main-merge contract was mutated.", failures);
  requireCondition(rollout.productionAudit === "required-before-tag", "Historical Phase 194 production-audit contract was mutated.", failures);
  requireCondition(rollout.annotatedTag === "required-after-production-audit", "Historical Phase 194 tag contract was mutated.", failures);

  const requiredFiles = [
    "docs/releases/2.5.0.json",
    manifest.releaseNotes?.fa,
    manifest.releaseNotes?.en,
    "docs/releases/RELEASE_CHECKLIST_2.5.0_FA.md",
    "docs/phases/PHASE_193_NOTES_FA.md",
    "docs/phases/PHASE_194_NOTES_FA.md",
    "scripts/prepare-release-2.5.0.mjs",
    "docs/releases/2.4.0.json",
    "CHANGELOG.md",
    "README.md",
    "README_FA.md",
    "docs/README.md",
  ].filter(Boolean);
  for (const path of requiredFiles) requireCondition(existsSync(resolve(ROOT, path)), `Required historical 2.5.0 file is missing: ${path}`, failures);

  requireCondition(readText(manifest.releaseNotes.en).includes("Final release date: 2026-08-17"), "English 2.5.0 notes lost the final release date.", failures);
  requireCondition(readText(manifest.releaseNotes.fa).includes("تاریخ Final Release: 2026-08-17"), "Persian 2.5.0 notes lost the final release date.", failures);
  requireCondition(readText("CHANGELOG.md").includes("## [2.5.0] - 2026-08-17"), "CHANGELOG is missing the historical 2.5.0 heading.", failures);
  requireCondition(readText("README.md").includes("Version **2.5.0** is the latest stable"), "English README must keep identifying 2.5.0 as the latest stable release until Phase 202.", failures);
  requireCondition(readText("README_FA.md").includes("نسخه **۲.۵.۰** آخرین Release پایدار"), "Persian README must keep identifying 2.5.0 as the latest stable release until Phase 202.", failures);
  requireCondition(readText("docs/README.md").includes("2.5.0 final release"), "Docs index must preserve the 2.5.0 final-release entry.", failures);
  requireCondition(readText("docs/roadmap/BACKLOG_FA.md").includes("- [x] فاز ۱۹۳:"), "Roadmap must keep Phase 193 closed.", failures);
  requireCondition(readText("docs/roadmap/BACKLOG_FA.md").includes("- [x] فاز ۱۹۴:"), "Roadmap must keep Phase 194 closed.", failures);
  requireCondition(packageJson.scripts?.["release:prepare:2.5.0"] === "node scripts/prepare-release-2.5.0.mjs", "Historical 2.5.0 preparation command must remain available.", failures);
  requireCondition(packageJson.scripts?.["audit:tests"] === "node scripts/audit-test-coupling.mjs", "Behavioral test-coupling audit must remain wired.", failures);
  requireCondition(packageJson.dependencies?.["framer-motion"] === "^12.42.2", "Current source must preserve the released framer-motion dependency contract.", failures);
  requireCondition(Object.keys(packageJson.dependencies ?? {}).length + Object.keys(packageJson.devDependencies ?? {}).length === 33, "Phase 201 must not change the direct dependency count.", failures);

  return failures;
}

export function getRelease250Snapshot() {
  const manifest = readJson("docs/releases/2.5.0.json");
  const released240 = readJson("docs/releases/2.4.0.json");
  const packageJson = readJson("package.json");
  return {
    // Historical snapshot values stay pinned to the released 2.5.0 artifact even when current development advances.
    packageVersion: manifest.version,
    lockVersion: manifest.version,
    lockRootVersion: manifest.version,
    currentPackageVersion: packageJson.version,
    version: manifest.version,
    status: manifest.status,
    candidateDate: manifest.candidateDate,
    releaseDate: manifest.releaseDate,
    dataSchemaVersion: manifest.dataSchemaVersion,
    releasedSchemaBaseline: manifest.releasedSchemaBaseline,
    baselinePhase: manifest.releaseEvidence?.baselinePhase,
    baselineCommit: manifest.verifiedBaselineCommitPrefix,
    baselineTests: manifest.verifiedBaselineTestCount,
    candidatePhase: manifest.releaseEvidence?.candidatePhase,
    candidateCommit: manifest.verifiedCandidateCommitPrefix,
    candidateTests: manifest.verifiedCandidateTestCount,
    finalTargetTests: manifest.expectedFinalTestCount,
    migrationChain: manifest.releaseEvidence?.migrationChain,
    rollout: manifest.rollout,
    historical240: {
      version: released240.version,
      status: released240.status,
      schema: released240.dataSchemaVersion,
      tag: released240.tag,
    },
    hasReleaseCommit: Object.prototype.hasOwnProperty.call(manifest, "releaseCommit"),
    prepareCommand: packageJson.scripts?.["release:prepare:2.5.0"],
    directDependencyCount: Object.keys(packageJson.dependencies ?? {}).length + Object.keys(packageJson.devDependencies ?? {}).length,
  };
}

export function collectCandidate260AuditFailures() {
  const failures = [];
  const packageJson = readJson("package.json");
  const packageLock = readJson("package-lock.json");
  const manifest = readJson("docs/releases/2.6.0.json");
  const released250 = readJson("docs/releases/2.5.0.json");

  requireCondition(packageJson.version === "2.6.0", "package.json must be 2.6.0 for Phase 201 candidate packaging.", failures);
  requireCondition(packageLock.version === "2.6.0", "package-lock.json root version must be 2.6.0.", failures);
  requireCondition(packageLock.packages?.[""]?.version === "2.6.0", "package-lock root package version must be 2.6.0.", failures);
  requireCondition(manifest.version === "2.6.0", "2.6.0 candidate manifest version is stale.", failures);
  requireCondition(manifest.status === "release-candidate", "2.6.0 manifest must remain release-candidate during Phase 201.", failures);
  requireCondition(manifest.candidateDate === "2026-08-20", "2.6.0 candidate date must be 2026-08-20.", failures);
  requireCondition(manifest.releaseDate === null, "2.6.0 releaseDate must stay null during Phase 201.", failures);
  requireCondition(manifest.candidateCommit === null, "Phase 201 source must not invent or self-reference a candidate commit before the local commit exists.", failures);
  requireCondition(manifest.tag === "v2.6.0", "2.6.0 manifest must reserve the v2.6.0 tag name without creating it.", failures);
  requireCondition(manifest.dataSchemaVersion === 21, "2.6.0 candidate schema must be v21.", failures);
  requireCondition(manifest.releasedSchemaBaseline === 20, "2.6.0 must use released 2.5.0 schema v20 as its migration baseline.", failures);
  requireCondition(APP_DATA_SCHEMA_VERSION === 21, "Phase 201 candidate source must stay on AppData v21.", failures);
  requireCondition(released250.version === "2.5.0" && released250.status === "released" && released250.dataSchemaVersion === 20, "2.5.0 must remain the released v20 historical baseline.", failures);
  requireCondition(manifest.nodeEngine === packageJson.engines?.node, "2.6.0 Node engine must match package.json.", failures);
  requireCondition(manifest.verifiedBaselineCommitPrefix === "15f5af8", "2.6.0 must pin the verified Phase 200 baseline 15f5af8.", failures);
  requireCondition(manifest.verifiedBaselineTestCount === 958, "2.6.0 must pin the 958-test Phase 200 baseline.", failures);
  requireCondition(manifest.candidatePhase === 201, "2.6.0 candidate phase must be 201.", failures);
  requireCondition(manifest.expectedCandidateTestCount === 964, "Phase 201 candidate Node-test target must be 964.", failures);

  const evidence = manifest.releaseEvidence ?? {};
  requireCondition(evidence.baselinePhase === 200, "2.6.0 must identify Phase 200 as the verified baseline.", failures);
  requireCondition(evidence.candidatePhase === 201, "2.6.0 must identify Phase 201 as the candidate phase.", failures);
  requireCondition(evidence.phase200BaselineCommitPrefix === "15f5af8", "2.6.0 evidence must preserve Phase 200 commit 15f5af8.", failures);
  requireCondition(evidence.phase200BaselineTestCount === 958, "2.6.0 evidence must preserve 958 baseline tests.", failures);
  requireCondition(evidence.developmentSchema === 21, "2.6.0 evidence must identify development schema v21.", failures);
  requireCondition(evidence.released250Schema === 20, "2.6.0 evidence must identify released 2.5.0 schema v20.", failures);
  requireCondition(JSON.stringify(evidence.migrationChain) === JSON.stringify([21]), "2.6.0 release migration chain must be v20 -> v21.", failures);
  for (const key of ["productionBrowserSmoke", "freelancerBrowserSmoke", "employeeBrowserSmoke", "pairingBrowserSmoke", "vercelStaticExportAudit", "hardeningAudit", "i18nClosureAudit", "testCouplingAudit"]) {
    requireCondition(evidence[key] === "passed-on-phase200-baseline", `2.6.0 baseline evidence ${key} must preserve the green Phase 200 gate.`, failures);
  }
  requireCondition(evidence.productionDomainAudit === "required-after-main-deploy", "2.6.0 production-domain audit must remain a Phase 202 requirement.", failures);

  const rollout = manifest.rollout ?? {};
  requireCondition(rollout.branch === "dev", "Phase 201 candidate must stay on dev.", failures);
  requireCondition(rollout.mainMerge === "phase-202-only", "Phase 201 must not merge the candidate to main.", failures);
  requireCondition(rollout.productionAudit === "phase-202-only", "Phase 201 must not claim a production audit.", failures);
  requireCondition(rollout.annotatedTag === "phase-202-only", "Phase 201 must not create the annotated tag.", failures);

  const requiredFiles = [
    "docs/releases/2.6.0.json",
    manifest.releaseNotes?.fa,
    manifest.releaseNotes?.en,
    "docs/releases/RELEASE_CHECKLIST_2.6.0_FA.md",
    "docs/phases/PHASE_201_NOTES_FA.md",
    "scripts/prepare-release-2.6.0.mjs",
    "docs/releases/2.5.0.json",
    "docs/phases/PHASE_200_FINAL_QA_FA.md",
    "CHANGELOG.md",
    "README.md",
    "README_FA.md",
    "docs/README.md",
  ].filter(Boolean);
  for (const path of requiredFiles) requireCondition(existsSync(resolve(ROOT, path)), `Required Phase 201 candidate file is missing: ${path}`, failures);

  requireCondition(readText(manifest.releaseNotes.en).includes("Final release date: not set yet"), "English 2.6.0 notes must keep the final release date unset.", failures);
  requireCondition(readText(manifest.releaseNotes.fa).includes("تاریخ Final Release: هنوز تعیین نشده"), "Persian 2.6.0 notes must keep the final release date unset.", failures);
  requireCondition(readText("CHANGELOG.md").includes("## [2.6.0] - Release Candidate 2026-08-20"), "CHANGELOG is missing the 2.6.0 candidate heading.", failures);
  requireCondition(readText("README.md").includes("2.6.0 Release Candidate"), "English README must link the 2.6.0 candidate without calling it stable.", failures);
  requireCondition(readText("README_FA.md").includes("Release Candidate ۲.۶.۰"), "Persian README must link the 2.6.0 candidate without calling it stable.", failures);
  requireCondition(readText("docs/README.md").includes("2.6.0 release candidate"), "Docs index must identify the 2.6.0 release candidate.", failures);
  requireCondition(readText("docs/roadmap/BACKLOG_FA.md").includes("- [x] **Phase 200 — Release Hardening & Scope Freeze**"), "Roadmap must close Phase 200 before Phase 201 candidate packaging.", failures);
  requireCondition(readText("docs/roadmap/BACKLOG_FA.md").includes("- [ ] **Phase 201 — Release Candidate 2.6.0**"), "Roadmap must keep Phase 201 pending until its local candidate commit is verified.", failures);

  requireCondition(packageJson.scripts?.["release:prepare:2.6.0"] === "node scripts/prepare-release-2.6.0.mjs", "2.6.0 baseline preparation command is missing.", failures);
  requireCondition(packageJson.scripts?.["check:release:candidate:2.6.0"] === "npm run release:prepare:2.6.0 && npm run check:release:full", "2.6.0 candidate aggregate gate command is missing.", failures);
  requireCondition(packageJson.scripts?.["check:release:full"] === "npm run check:quality && npm run check:release:audit && npm run test:browser:production:built && npm run test:browser:freelancer:built && npm run test:browser:employee:built && npm run test:browser:pairing && npm run audit:vercel", "Full release gate must preserve the Phase 200 order.", failures);
  requireCondition(packageJson.scripts?.["audit:hardening"] === "node scripts/release-hardening-audit.mjs", "Release hardening audit must remain wired in Phase 201.", failures);
  requireCondition(packageJson.dependencies?.["framer-motion"] === "^12.42.2", "Phase 201 must not change the existing framer-motion contract.", failures);
  requireCondition(Object.keys(packageJson.dependencies ?? {}).length + Object.keys(packageJson.devDependencies ?? {}).length === 33, "Phase 201 must not change the direct dependency count.", failures);

  return failures;
}

export function getRelease260Snapshot() {
  const manifest = readJson("docs/releases/2.6.0.json");
  const released250 = readJson("docs/releases/2.5.0.json");
  const packageJson = readJson("package.json");
  const packageLock = readJson("package-lock.json");
  return {
    packageVersion: packageJson.version,
    lockVersion: packageLock.version,
    lockRootVersion: packageLock.packages?.[""]?.version,
    version: manifest.version,
    status: manifest.status,
    candidateDate: manifest.candidateDate,
    releaseDate: manifest.releaseDate,
    candidateCommit: manifest.candidateCommit,
    dataSchemaVersion: manifest.dataSchemaVersion,
    releasedSchemaBaseline: manifest.releasedSchemaBaseline,
    baselinePhase: manifest.releaseEvidence?.baselinePhase,
    baselineCommit: manifest.verifiedBaselineCommitPrefix,
    baselineTests: manifest.verifiedBaselineTestCount,
    candidatePhase: manifest.candidatePhase,
    candidateTargetTests: manifest.expectedCandidateTestCount,
    migrationChain: manifest.releaseEvidence?.migrationChain,
    rollout: manifest.rollout,
    historical250: {
      version: released250.version,
      status: released250.status,
      schema: released250.dataSchemaVersion,
      tag: released250.tag,
    },
    prepareCommand: packageJson.scripts?.["release:prepare:2.6.0"],
    candidateCommand: packageJson.scripts?.["check:release:candidate:2.6.0"],
    hardeningCommand: packageJson.scripts?.["audit:hardening"],
    directDependencyCount: Object.keys(packageJson.dependencies ?? {}).length + Object.keys(packageJson.devDependencies ?? {}).length,
  };
}

export function runReleaseAudit() {
  const historical240Failures = collectReleaseAuditFailures();
  const historical250Failures = collectFinal250AuditFailures();
  const candidate260Failures = collectCandidate260AuditFailures();
  const failures = [...historical240Failures, ...historical250Failures, ...candidate260Failures];
  if (failures.length > 0) {
    console.error("Saatyar release audit failed\n");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return false;
  }
  const manifest = readJson("docs/releases/2.6.0.json");
  console.log(`Saatyar ${manifest.version} release-candidate audit passed.`);
  console.log(`Current AppData schema: v${APP_DATA_SCHEMA_VERSION}`);
  console.log(`Released 2.5.0 AppData schema: v${manifest.releasedSchemaBaseline}`);
  console.log(`Candidate manifest status: ${manifest.status}`);
  console.log(`Verified Phase 200 baseline: ${manifest.verifiedBaselineCommitPrefix} (${manifest.verifiedBaselineTestCount} tests)`);
  console.log(`Phase 201 Node test target: ${manifest.expectedCandidateTestCount}`);
  console.log("Phase 201 stays on dev. Main merge -> production audit -> annotated v2.6.0 tag belong to Phase 202.");
  return true;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runReleaseAudit();
