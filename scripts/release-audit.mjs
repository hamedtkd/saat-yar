import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RELEASE_MANIFEST_PATH = "docs/releases/2.1.0.json";

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

  requireCondition(packageJson.version === manifest.version, "package.json version does not match the release manifest.", failures);
  requireCondition(packageLock.version === manifest.version, "package-lock.json root version does not match the release manifest.", failures);
  requireCondition(packageLock.packages?.[""]?.version === manifest.version, "package-lock.json package version does not match the release manifest.", failures);
  requireCondition(packageJson.engines?.node === manifest.nodeEngine, "Node engine does not match the release manifest.", failures);
  requireCondition(APP_DATA_SCHEMA_VERSION >= manifest.dataSchemaVersion, "Current AppData schema cannot be older than the released manifest schema.", failures);
  requireCondition(manifest.status === "released", "Release manifest status must be released after the v2.1.0 tag is published.", failures);
  requireCondition(manifest.tag === `v${manifest.version}`, "Release manifest tag is missing or does not match the version.", failures);
  requireCondition(Boolean(manifest.releaseCommit), "Release manifest commit is missing.", failures);

  const requiredFiles = [
    RELEASE_MANIFEST_PATH,
    manifest.releaseNotes?.fa,
    manifest.releaseNotes?.en,
    "RELEASE_CHECKLIST_FA.md",
    "CHANGELOG.md",
    "README.md",
    "README_EN.md",
  ].filter(Boolean);
  for (const path of requiredFiles) {
    requireCondition(existsSync(resolve(ROOT, path)), `Required release file is missing: ${path}`, failures);
  }

  const releaseHeading = `## [${manifest.version}] - ${manifest.releaseDate}`;
  requireCondition(includesLine("CHANGELOG.md", releaseHeading), `CHANGELOG.md is missing ${releaseHeading}`, failures);
  requireCondition(includesLine("RELEASE_CHECKLIST_FA.md", `# چک‌لیست انتشار ساعت‌یار ${manifest.version}`), "Release checklist version is stale.", failures);
  requireCondition(readText("README.md").includes(manifest.releaseNotes.fa), "Persian README does not link to Persian release notes.", failures);
  requireCondition(readText("README_EN.md").includes(manifest.releaseNotes.en), "English README does not link to English release notes.", failures);

  const releaseSteps = packageJson.scripts?.["check:release"]?.split("&&").map((step) => step.trim()) ?? [];
  requireCondition(releaseSteps[0] === "npm run check:quality", "check:release must start with check:quality.", failures);
  requireCondition(releaseSteps[1] === "npm run check:release:audit", "check:release must run the release audit after quality checks.", failures);
  requireCondition(releaseSteps[2] === "npm run test:browser:production:built", "check:release must finish with the built production browser smoke.", failures);
  requireCondition(packageJson.scripts?.["check:release:audit"] === "node --experimental-strip-types scripts/release-audit.mjs", "Release audit script command is missing or stale.", failures);
  requireCondition(packageJson.scripts?.test?.includes("tests/phase99-release-readiness.test.ts"), "Phase 99 contract test is not part of npm test.", failures);

  const declaredTests = new Set((packageJson.scripts?.test?.match(/tests\/[A-Za-z0-9_.-]+\.test\.ts/g) ?? []));
  const discoveredTests = readdirSync(resolve(ROOT, "tests"))
    .filter((name) => name.endsWith(".test.ts"))
    .map((name) => `tests/${name}`);
  for (const testPath of discoveredTests) {
    requireCondition(declaredTests.has(testPath), `Test file is not included in npm test: ${testPath}`, failures);
  }

  const releaseBacklog = sectionLines("docs/roadmap/BACKLOG_FA.md", "## آمادگی انتشار ۲.۱.۰");
  requireCondition(releaseBacklog.length > 0, "Release-readiness backlog section is missing.", failures);
  requireCondition(!releaseBacklog.some((line) => line.includes("- [ ]")), "Release-readiness backlog still contains open items.", failures);

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
  console.log(`Released AppData schema: v${manifest.dataSchemaVersion}`);
  console.log(`Current AppData schema: v${APP_DATA_SCHEMA_VERSION}`);
  console.log(`Release status: ${manifest.status}`);
  return true;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runReleaseAudit();
}
