import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("legacy architecture tests follow current stable identifiers", async () => {
  const navigation = await read("tests/phase41-settings-navigation-hardening.test.ts");
  const dayUx = await read("tests/phase66-day-specific-editor-ux.test.ts");
  const draft = await read("tests/phase67-historical-record-draft.test.ts");

  assert.match(navigation, /navigateTo/);
  assert.match(dayUx, /record\\\.start/);
  assert.match(draft, /updateRecord\\\(saved/);
  assert.doesNotMatch(navigation, /goTo =/);
  assert.doesNotMatch(draft, /props\\\.updateRecord/);
});

test("quality check normalizes misplaced documentation before tests", async () => {
  const pkg = JSON.parse(await read("package.json")) as { scripts: Record<string, string> };
  const script = await read("scripts/normalize-docs-layout.mjs");

  assert.match(pkg.scripts.check, /npm run clean:docs/);
  assert.equal(pkg.scripts["clean:docs"], "node scripts/normalize-docs-layout.mjs");
  assert.match(script, /\^PHASE_\.\*\\\.md\$/);
  assert.match(script, /docs.*phases/);
  assert.match(script, /BACKLOG_FA\.md/);
});
