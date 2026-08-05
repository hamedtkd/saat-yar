import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("today secondary surfaces use shared semantic theme tokens", async () => {
  const files = await Promise.all([
    read("components/pages/today/manual-entry-form.tsx"),
    read("components/pages/today/today-timeline.tsx"),
    read("components/pages/today/today-time-strip.tsx"),
    read("components/pages/today/time-strip/quick-controls.tsx"),
    read("components/pages/today/time-strip/lunch-editor.tsx"),
    read("components/pages/today/time-strip/breaks-editor.tsx"),
  ]);
  const source = files.join("\n");
  for (const token of ["bg-white", "#dfe7e9", "#079b60", "#102a3a"]) assert.equal(source.includes(token), false, `legacy color returned: ${token}`);
  assert.match(source, /SurfaceCard/);
  assert.match(source, /var\(--surface-2\)/);
});

test("onboarding mode and progress controls follow the selected theme", async () => {
  const source = (await Promise.all([
    read("components/layout/onboarding/mode-option.tsx"),
    read("components/layout/onboarding/mode-step.tsx"),
    read("components/layout/onboarding/steps-progress.tsx"),
  ])).join("\n");
  assert.match(source, /aria-pressed/);
  assert.match(source, /var\(--accent\)/);
  assert.equal(source.includes("border-2"), false);
  assert.equal(source.includes("bg-white"), false);
});

test("shared text input uses the restrained focus ring", async () => {
  const source = await read("components/ui/input.tsx");
  assert.match(source, /focus-visible:ring-2/);
  assert.equal(source.includes("focus-visible:ring-4"), false);
});
