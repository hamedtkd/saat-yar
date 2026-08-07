import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("workspace switcher keeps Radix SelectLabel inside SelectGroup", async () => {
  const source = await read("components/layout/app-header/workspace-switcher.tsx");
  assert.match(source, /SelectGroup/);
  assert.match(source, /<SelectGroup>[\s\S]*<SelectLabel>[\s\S]*<SelectItem value="employee">[\s\S]*<\/SelectGroup>/);
});

test("production smoke fails fast when hydration throws a runtime exception", async () => {
  const source = await read("scripts/production-browser-smoke.mjs");
  assert.match(source, /this\.runtimeErrors = \[\]/);
  assert.match(source, /client\.runtimeErrors\.length > 0/);
  assert.match(source, /Browser runtime error while waiting for/);
});

test("phase 124 runtime hotfix is wired into the main quality command", async () => {
  const pkg = JSON.parse(await read("package.json"));
  assert.match(pkg.scripts.test, /tests\/phase124-runtime-select-hotfix\.test\.ts/);
});
