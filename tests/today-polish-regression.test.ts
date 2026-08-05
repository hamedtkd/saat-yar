import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("today focus card keeps employee notes compact and freelancer fields aligned", async () => {
  const source = await read("components/pages/today/today-focus-card.tsx");
  assert.match(source, /isEmployee \? "flex min-h-52 items-center"/);
  assert.match(source, /grid grid-cols-12 content-center gap-4/);
  assert.match(source, /col-span-8 max-\[720px\]:col-span-12/);
  assert.match(source, /col-span-4 flex h-11/);
});

test("shared cards and selects use restrained elevation and focus treatment", async () => {
  const card = await read("components/common/surface-card.tsx");
  const select = await read("components/ui/select.tsx");
  const css = await read("app/globals.css");
  assert.doesNotMatch(card, /0_18px_55px|0_20px_70px/);
  assert.match(select, /focus:ring-2/);
  assert.doesNotMatch(select, /focus:ring-4/);
  assert.match(css, /outline: 2px solid var\(--accent\)/);
});

test("quality checks remove obsolete copied entrypoints before validation", async () => {
  const pkg = JSON.parse(await read("package.json"));
  const cleanup = await read("scripts/remove-obsolete-entrypoints.mjs");
  assert.match(pkg.scripts.check, /^npm run clean:obsolete/);
  assert.match(cleanup, /app\/date-time-pickers\.tsx/);
  assert.match(cleanup, /app\/storage\.ts/);
});
