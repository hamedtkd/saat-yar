import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ACTIVE_RELEASE_VERSION = "2.3.1";
const RELEASE_MANIFEST_PATH = `docs/releases/${ACTIVE_RELEASE_VERSION}.json`;
const REQUIRED_MEDIA = [
  "docs/assets/screenshots/today-light-desktop.png",
  "docs/assets/screenshots/today-dark-desktop.png",
  "docs/assets/screenshots/today-mobile.png",
  "docs/assets/screenshots/reports-light.png",
  "docs/assets/screenshots/reports-dark.png",
  "docs/assets/media/onboarding.gif",
];

function readText(path) {
  return readFileSync(resolve(ROOT, path), "utf8");
}

function readJson(path) {
  return JSON.parse(readText(path));
}

function lines(path) {
  return readText(path).split(/\r?\n/);
}

function requireCondition(condition, message, failures) {
  if (!condition) failures.push(message);
}

function includesLine(path, expected) {
  return lines(path).some((line) => line.trim() === expected);
}

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

  requireCondition(packageJson.version === ACTIVE_RELEASE_VERSION, "package.json is not on the active 2.3.1 patch release.", failures);
  requireCondition(packageJson.version === manifest.version, "package.json version does not match the active release manifest.", failures);
  requireCondition(packageLock.version === manifest.version, "package-lock.json root version does not match the active release manifest.", failures);
  requireCondition(packageLock.packages?.[""]?.version === manifest.version, "package-lock.json package version does not match the active release manifest.", failures);
  requireCondition(packageJson.engines?.node === manifest.nodeEngine, "Node engine does not match the release manifest.", failures);
  requireCondition(APP_DATA_SCHEMA_VERSION === manifest.dataSchemaVersion, "Current AppData schema must exactly match the active release manifest schema.", failures);
  requireCondition(manifest.status === "released", "2.3.1 manifest must be finalized as released before the annotated tag is created.", failures);
  requireCondition(manifest.tag === `v${manifest.version}`, "Release manifest tag is missing or does not match the version.", failures);

  requireCondition(/^[0-9a-f]{7,40}$/.test(manifest.verifiedBaselineCommitPrefix ?? ""), "2.3.1 must record the verified Phase 158 baseline commit prefix.", failures);
  requireCondition(manifest.verifiedBaselineCommitPrefix === "7c675e1", "2.3.1 must preserve the verified Phase 158 baseline commit prefix 7c675e1.", failures);
  requireCondition(manifest.verifiedBaselineTestCount === 601, "2.3.1 must record the verified 601-test Phase 158 baseline.", failures);
  requireCondition(manifest.expectedFinalTestCount === 607, "2.3.1 must declare the 607-test Phase 159 final gate.", failures);

  const evidence = manifest.releaseEvidence ?? {};
  requireCondition(evidence.productionBrowserSmoke === "passed", "2.3.1 must preserve passing production browser evidence.", failures);
  requireCondition(evidence.freelancerBrowserSmoke === "passed", "2.3.1 must preserve passing freelancer browser evidence.", failures);
  requireCondition(evidence.employeeBrowserSmoke === "passed", "2.3.1 must preserve passing employee browser evidence.", failures);
  requireCondition(evidence.pairingBrowserSmoke === "passed", "2.3.1 must preserve passing pairing browser evidence.", failures);
  requireCondition(evidence.pairingEncryptedChunks === 4, "2.3.1 must preserve the four encrypted pairing chunks verified on the baseline.", failures);
  requireCondition(evidence.vercelStaticExportAudit === "passed", "2.3.1 must preserve the passing Vercel static-export audit.", failures);
  requireCondition(evidence.productionDomainAudit === "passed", "2.3.1 must preserve the passing post-deploy production audit.", failures);
  requireCondition(evidence.productionPrecacheAssets === 37, "2.3.1 must preserve the verified 37 production precache build assets.", failures);
  requireCondition(evidence.employeeNetMinutes === 495, "2.3.1 must preserve the 495-minute employee reference-day evidence.", failures);
  requireCondition(!Object.prototype.hasOwnProperty.call(manifest, "releaseCommit"), "Released manifest must not contain a self-referential releaseCommit field; the annotated Git tag is the source of truth.", failures);

  const requiredFiles = [
    RELEASE_MANIFEST_PATH,
    manifest.releaseNotes?.fa,
    manifest.releaseNotes?.en,
    "docs/releases/2.3.0.json",
    "docs/releases/2.2.0.json",
    "docs/releases/2.1.0.json",
    "RELEASE_CHECKLIST_FA.md",
    "CHANGELOG.md",
    "README.md",
    "README_EN.md",
    "docs/README.md",
    "docs/phases/PHASE_159_NOTES_FA.md",
    "docs/assets/README.md",
  ].filter(Boolean);
  for (const path of requiredFiles) {
    requireCondition(existsSync(resolve(ROOT, path)), `Required release file is missing: ${path}`, failures);
  }

  const releaseHeading = `## [${manifest.version}] - ${manifest.releaseDate}`;
  requireCondition(includesLine("CHANGELOG.md", releaseHeading), `CHANGELOG.md is missing ${releaseHeading}`, failures);
  requireCondition(includesLine("RELEASE_CHECKLIST_FA.md", `# چک‌لیست انتشار ساعت‌یار ${manifest.version}`), "Release checklist version is stale.", failures);
  requireCondition(readText("README.md").includes(manifest.releaseNotes.fa), "Persian README does not link to Persian 2.3.1 release notes.", failures);
  requireCondition(readText("README_EN.md").includes(manifest.releaseNotes.en), "English README does not link to English 2.3.1 release notes.", failures);
  requireCondition(readText("docs/README.md").includes("./releases/2.3.1.json"), "Docs index does not link to the active 2.3.1 release manifest.", failures);

  const historical230 = readJson("docs/releases/2.3.0.json");
  requireCondition(historical230.version === "2.3.0", "Historical 2.3.0 manifest was mutated.", failures);
  requireCondition(historical230.tag === "v2.3.0", "Historical 2.3.0 tag contract was mutated.", failures);
  requireCondition(historical230.expectedFinalTestCount === 581, "Historical 2.3.0 final test evidence was mutated.", failures);

  const readmeFa = readText("README.md");
  const readmeEn = readText("README_EN.md");
  for (const mediaPath of REQUIRED_MEDIA) {
    requireCondition(readmeFa.includes(mediaPath), `Persian README is missing product media reference: ${mediaPath}`, failures);
    requireCondition(readmeEn.includes(mediaPath), `English README is missing product media reference: ${mediaPath}`, failures);
  }
  const mediaContract = readText("docs/assets/README.md");
  requireCondition(mediaContract.includes("npm run media:capture"), "Media contract must document the reproducible capture command.", failures);
  requireCondition(mediaContract.includes("Fixture"), "Media contract must state that capture uses demo fixture data.", failures);

  const releaseSteps = packageJson.scripts?.["check:release"]?.split("&&").map((step) => step.trim()) ?? [];
  const expectedReleaseSteps = [
    "npm run check:quality",
    "npm run check:release:audit",
    "npm run test:browser:production:built",
    "npm run test:browser:freelancer:built",
    "npm run test:browser:employee:built",
  ];
  requireCondition(releaseSteps.length === expectedReleaseSteps.length, "check:release must contain exactly the five current release-gate steps.", failures);
  for (const [index, expected] of expectedReleaseSteps.entries()) {
    requireCondition(releaseSteps[index] === expected, `check:release step ${index + 1} must be ${expected}.`, failures);
  }

  requireCondition(packageJson.scripts?.["check:release:audit"] === "node --experimental-strip-types scripts/release-audit.mjs", "Release audit script command is missing or stale.", failures);
  requireCondition(packageJson.scripts?.["test:browser:production:built"] === "node scripts/production-browser-smoke.mjs", "Production browser gate command is missing or stale.", failures);
  requireCondition(packageJson.scripts?.["test:browser:freelancer:built"] === "node --experimental-strip-types scripts/freelancer-browser-ux-smoke.mjs", "Freelancer browser gate command is missing or stale.", failures);
  requireCondition(packageJson.scripts?.["test:browser:employee:built"] === "node --experimental-strip-types scripts/employee-browser-ux-smoke.mjs", "Employee browser gate command is missing or stale.", failures);
  requireCondition(packageJson.scripts?.["test:browser:pairing"] === "node scripts/device-pairing-browser-smoke.mjs", "Encrypted device-pairing browser smoke command is missing or stale.", failures);
  requireCondition(packageJson.scripts?.["audit:production"] === "node scripts/remote-production-audit.mjs", "Production-domain audit command is missing or stale.", failures);
  requireCondition(packageJson.scripts?.["audit:vercel"] === "node scripts/vercel-static-export-contract.mjs", "Vercel deployment-contract audit command is missing or stale.", failures);

  requireCondition(manifest.qualityCommand === "npm run check:release", "Release manifest quality command is stale.", failures);
  requireCondition(manifest.browserGate === "scripts/production-browser-smoke.mjs", "Release manifest production browser gate path is stale.", failures);
  requireCondition(manifest.freelancerBrowserGate === "scripts/freelancer-browser-ux-smoke.mjs", "Release manifest freelancer browser gate path is stale.", failures);
  requireCondition(manifest.employeeBrowserGate === "scripts/employee-browser-ux-smoke.mjs", "Release manifest employee browser gate path is stale.", failures);
  requireCondition(manifest.pairingCommand === "npm run test:browser:pairing", "Release manifest must expose the pairing browser gate command.", failures);
  requireCondition(manifest.pairingBrowserGate === "scripts/device-pairing-browser-smoke.mjs", "Release manifest pairing browser gate path is stale.", failures);
  requireCondition(manifest.productionAuditCommand === "npm run audit:production", "Release manifest production audit command is stale.", failures);
  requireCondition(manifest.vercelAuditCommand === "npm run audit:vercel", "Release manifest Vercel audit command is stale.", failures);

  const declaredTests = new Set(packageJson.scripts?.test?.match(/tests\/[A-Za-z0-9_.-]+\.test\.ts/g) ?? []);
  const discoveredTests = readdirSync(resolve(ROOT, "tests"))
    .filter((name) => name.endsWith(".test.ts"))
    .map((name) => `tests/${name}`);
  for (const testPath of discoveredTests) {
    requireCondition(declaredTests.has(testPath), `Test file is not included in npm test: ${testPath}`, failures);
  }

  const releaseBacklog = sectionLines("docs/roadmap/BACKLOG_FA.md", "## آمادگی انتشار ۲.۳.۱");
  requireCondition(releaseBacklog.length > 0, "2.3.1 release-readiness backlog section is missing.", failures);
  const backlogText = releaseBacklog.join("\n");
  requireCondition(backlogText.includes("- [x] فاز ۱۵۹:"), "Phase 159 must be marked complete in the 2.3.1 release-readiness backlog.", failures);
  requireCondition(backlogText.includes("7c675e1"), "2.3.1 backlog must preserve the verified Phase 158 baseline commit.", failures);
  requireCondition(backlogText.includes("۶۰۱/۶۰۱"), "2.3.1 backlog must preserve the verified 601-test baseline.", failures);

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
  console.log(`Saatyar ${manifest.version} release audit passed.`);
  console.log(`Current AppData schema: v${APP_DATA_SCHEMA_VERSION}`);
  console.log(`Release status: ${manifest.status}`);
  console.log(`Verified baseline commit prefix: ${manifest.verifiedBaselineCommitPrefix}`);
  console.log(`Verified baseline test count: ${manifest.verifiedBaselineTestCount}`);
  console.log(`Expected final test count: ${manifest.expectedFinalTestCount}`);
  return true;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runReleaseAudit();
}
