import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { accentStrong, readableAccentForeground } from "../lib/theme.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("accent foreground keeps light and dark custom colors readable", () => {
  assert.equal(readableAccentForeground("#1ed760"), "#07130c");
  assert.equal(readableAccentForeground("#0ea5e9"), "#07130c");
  assert.equal(readableAccentForeground("#8b5cf6"), "#ffffff");
  assert.notEqual(accentStrong("#0ea5e9", "light"), "#087f45");
  assert.notEqual(accentStrong("#f97316", "dark"), "#51e884");
});

test("theme runtime and bootstrap apply all accent-dependent tokens", async () => {
  const runtime = await read("components/theme/theme-runtime.tsx");
  const bootstrap = await read("components/theme/theme-bootstrap.tsx");
  for (const token of ["--accent", "--accent-foreground", "--accent-strong"]) {
    assert.match(runtime, new RegExp(token));
    assert.match(bootstrap, new RegExp(token));
  }
});

test("settings and today forms use the shared modern checkbox", async () => {
  const files = [
    "components/pages/settings/work-settings-card.tsx",
    "components/pages/settings/holiday-overrides-card.tsx",
    "components/pages/settings/payroll-settings-card.tsx",
    "components/pages/settings/notification-settings-card.tsx",
    "components/pages/today/time-strip/lunch-editor.tsx",
    "components/pages/today/manual-entry-form.tsx",
  ];
  for (const file of files) {
    const source = await read(file);
    assert.match(source, /<Checkbox/);
    assert.doesNotMatch(source, /accent-\[var\(--accent\)\]/);
  }
  const checkbox = await read("components/ui/checkbox.tsx");
  assert.match(checkbox, /appearance-none/);
  assert.match(checkbox, /peer-checked:opacity-100/);
  assert.match(checkbox, /text-\[var\(--accent-foreground\)\]/);
});
