import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const TEST_ROOT = path.resolve("tests");
const MAX_SOURCE_COUPLED_FILES = 167;
const MAX_EXPLICIT_TEST_SCRIPT_ASSERTIONS = 36;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else if (entry.name.endsWith(".test.ts") || entry.name.endsWith(".test.mjs")) files.push(absolute);
  }
  return files;
}

function phaseNumber(file) {
  const match = path.basename(file).match(/^phase(\d+)/i);
  return match ? Number(match[1]) : null;
}

export async function collectTestCoupling(root = TEST_ROOT) {
  const files = await walk(root);
  const sourceCoupled = [];
  const explicitScriptAssertions = [];
  const modernPhaseViolations = [];

  for (const file of files) {
    const source = await readFile(file, "utf8");
    const relative = path.relative(process.cwd(), file).replaceAll("\\", "/");
    const readsRepositorySource = /\b(?:readFileSync|readFile)\s*\(/.test(source);
    const assertsOwnTestScript = /scripts\.test[\s\S]{0,180}(?:assert\.(?:match|ok)|\.includes\()/.test(source);

    if (readsRepositorySource) sourceCoupled.push(relative);
    if (assertsOwnTestScript) explicitScriptAssertions.push(relative);

    const phase = phaseNumber(file);
    if (phase !== null && phase >= 192 && readsRepositorySource) {
      modernPhaseViolations.push(`${relative}: Phase ${phase} must test behavior/contracts without reading repository source.`);
    }
  }

  return { files, sourceCoupled, explicitScriptAssertions, modernPhaseViolations };
}

export async function auditTestCoupling() {
  const result = await collectTestCoupling();
  const failures = [...result.modernPhaseViolations];

  if (result.sourceCoupled.length > MAX_SOURCE_COUPLED_FILES) {
    failures.push(`Source-coupled test files grew from the Phase 192 baseline: ${result.sourceCoupled.length} > ${MAX_SOURCE_COUPLED_FILES}.`);
  }
  if (result.explicitScriptAssertions.length > MAX_EXPLICIT_TEST_SCRIPT_ASSERTIONS) {
    failures.push(`Per-file npm-test wiring assertions grew from the Phase 192 baseline: ${result.explicitScriptAssertions.length} > ${MAX_EXPLICIT_TEST_SCRIPT_ASSERTIONS}.`);
  }

  const pkg = JSON.parse(await readFile(path.resolve("package.json"), "utf8"));
  if (!String(pkg.scripts?.test ?? "").includes('"tests/**/*.test.ts"')) {
    failures.push("npm test must retain generic test discovery so new behavioral tests do not require filename wiring.");
  }

  return { ...result, failures };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = await auditTestCoupling();
  if (result.failures.length) {
    console.error("Test coupling audit failed:");
    for (const failure of result.failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log(`Test coupling audit passed across ${result.files.length} test files.`);
    console.log(`Historical source-coupled files: ${result.sourceCoupled.length}/${MAX_SOURCE_COUPLED_FILES} budget.`);
    console.log(`Historical per-file npm-test assertions: ${result.explicitScriptAssertions.length}/${MAX_EXPLICIT_TEST_SCRIPT_ASSERTIONS} budget.`);
    console.log("Phase 192+ tests are source-inspection free and npm test retains generic discovery.");
  }
}
