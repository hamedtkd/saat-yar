import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = join(process.cwd(), "components/pages/today");

test("today time strip modules stay below 250 lines", () => {
  const files = [join(root, "today-time-strip.tsx"), ...readdirSync(join(root, "time-strip")).filter((name) => /\.(ts|tsx)$/.test(name)).map((name) => join(root, "time-strip", name))];
  for (const file of files) {
    const lines = readFileSync(file, "utf8").split(/\r?\n/).length;
    assert.ok(lines <= 250, `${file} has ${lines} lines`);
  }
});

test("today time strip delegates UI and logic", () => {
  const source = readFileSync(join(root, "today-time-strip.tsx"), "utf8");
  assert.match(source, /<TimeInputs/);
  assert.match(source, /<QuickControls/);
  assert.match(source, /<AdvancedEditor/);
  assert.doesNotMatch(source, /crypto\.randomUUID/);
});
