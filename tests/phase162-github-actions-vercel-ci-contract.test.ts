import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflowPath = new URL("../.github/workflows/deploy-pages.yml", import.meta.url);
const packagePath = new URL("../package.json", import.meta.url);
const notesPath = new URL("../docs/phases/PHASE_162_NOTES_FA.md", import.meta.url);

async function readWorkflow() {
  return readFile(workflowPath, "utf8");
}

test("GitHub Actions validates Saatyar without attempting an unused Pages deployment", async () => {
  const workflow = await readWorkflow();
  assert.match(workflow, /name:\s*Validate Saatyar/);
  assert.doesNotMatch(workflow, /actions\/deploy-pages/);
  assert.doesNotMatch(workflow, /actions\/upload-pages-artifact/);
  assert.doesNotMatch(workflow, /pages:\s*write/);
  assert.doesNotMatch(workflow, /id-token:\s*write/);
});

test("GitHub Actions builds the same static output contract used by Vercel", async () => {
  const workflow = await readWorkflow();
  assert.match(workflow, /npm run build:vercel/);
  assert.match(workflow, /npm run audit:vercel/);
  assert.doesNotMatch(workflow, /PAGES_BASE_PATH/);
  assert.doesNotMatch(workflow, /npm run build:pages/);
});

test("CI continues to run on main pushes and pull requests", async () => {
  const workflow = await readWorkflow();
  assert.match(workflow, /push:/);
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /branches:\s*\["main"\]/);
  assert.match(workflow, /permissions:\s*\n\s*contents:\s*read/);
});

test("Phase 162 is documented and wired into the main test command", async () => {
  const packageJson = await readFile(packagePath, "utf8");
  const notes = await readFile(notesPath, "utf8");
  assert.match(packageJson, /phase162-github-actions-vercel-ci-contract\.test\.ts/);
  assert.match(notes, /Vercel/);
  assert.match(notes, /GitHub Pages/);
});
