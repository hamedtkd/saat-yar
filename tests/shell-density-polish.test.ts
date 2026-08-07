import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("shell elevation and navigation density stay restrained", async () => {
  const [header, sidebar, actions, controlStyles] = await Promise.all([
    read("components/layout/app-header.tsx"),
    read("components/layout/navigation/sidebar-nav.tsx"),
    read("components/layout/app-header/header-actions.tsx"),
    read("components/layout/app-header/header-control-styles.ts"),
  ]);
  assert.match(header, /0_6px_20px/);
  assert.doesNotMatch(header, /0_12px_40px/);
  assert.match(sidebar, /0_10px_32px/);
  assert.match(sidebar, /min-h-11/);
  assert.match(actions, /headerControlShell/);
  assert.match(actions, /gap-0\.5 p-1/);
  assert.match(controlStyles, /bg-\[var\(--surface-1\)\]/);
  assert.match(controlStyles, /h-11 rounded-\[14px\]/);
});

test("shared buttons use compact accessible focus treatment", async () => {
  const button = await read("components/ui/button.tsx");
  assert.match(button, /focus-visible:ring-2/);
  assert.doesNotMatch(button, /focus-visible:ring-4/);
  assert.match(button, /transition-colors/);
});
