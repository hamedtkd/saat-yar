import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import test from "node:test";
import path from "node:path";

const root = process.cwd();
const read = (file: string) => readFile(path.join(root, file), "utf8");

test("phase documents live under docs instead of repository root", async () => {
  const rootEntries = await readdir(root);
  assert.deepEqual(rootEntries.filter((name) => /^PHASE_.*\.md$/.test(name)), []);
  assert.equal(rootEntries.includes("BACKLOG_FA.md"), false);
  assert.equal((await stat(path.join(root, "docs/phases/PHASE_60_NOTES_FA.md"))).isFile(), true);
  assert.equal((await stat(path.join(root, "docs/roadmap/BACKLOG_FA.md"))).isFile(), true);
});

test("agent guidance documents architecture quality and shadcn policy", async () => {
  const quick = await read("AGENTS.md");
  const guide = await read("docs/agents/AGENT_GUIDE_FA.md");
  assert.match(quick, /npm run check:quality/);
  assert.match(quick, /shadcn\/ui/);
  assert.match(quick, /docs\/phases/);
  assert.match(guide, /npx shadcn@latest add alert-dialog/);
  assert.match(guide, /Migration/);
  assert.match(guide, /Local-first/);
  assert.match(guide, /۲۵۰ خط/);
});

test("README and legacy tests reference the relocated backlog", async () => {
  const readme = await read("README.md");
  const phase50 = await read("tests/phase50-settings-layout-weekly-target.test.ts");
  const phase58 = await read("tests/phase58-readme-donation.test.ts");
  for (const source of [readme, phase50, phase58]) {
    assert.match(source, /docs\/roadmap\/BACKLOG_FA\.md/);
  }
});
