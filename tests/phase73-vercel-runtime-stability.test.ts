import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("data health collector keeps an explicit DataHealthItem array", async () => {
  const source = await read("lib/data-health.ts");
  assert.match(source, /const items: DataHealthItem\[\] = \[\]/);
  assert.doesNotMatch(source, /\.flatMap\(/);
});

test("phase 72 fixtures follow the current WorkRecord contract", async () => {
  const source = await read("tests/phase72-data-health-center.test.ts");
  assert.match(source, /lunchPaid: false/);
  assert.match(source, /end: ""/);
  assert.doesNotMatch(source, /paidLunch/);
  assert.doesNotMatch(source, /end: undefined/);
});

test("draft registry cleanup only publishes removal of dirty entries", async () => {
  const source = await read("lib/settings-draft-registry.ts");
  assert.match(source, /if \(current\?\.dirty\) emit\(\)/);
});

test("historical editor callbacks are stable across provider rerenders", async () => {
  const source = await read("components/pages/today/completed-day-editor.tsx");
  assert.match(source, /const cancelEdit = useCallback/);
  assert.match(source, /const saveEdit = useCallback/);
});
