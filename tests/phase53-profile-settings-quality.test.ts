import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("profile settings edit and persist the user display name", async () => {
  const card = await read("components/pages/settings/profile-settings-card.tsx");
  const page = await read("components/pages/settings/settings-page.tsx");
  assert.match(card, /useSettingsDraft/);
  assert.match(card, /settings: \{ \.\.\.previous\.settings, name: normalized \}/);
  assert.match(card, /EditableCardActions/);
  assert.match(card, /s\("Good morning, \{name\}"/);
  assert.match(page, /<ProfileSettingsCard/);
});

test("profile name validation is localized and bounded", async () => {
  const card = await read("components/pages/settings/profile-settings-card.tsx");
  assert.match(card, /MAX_NAME_LENGTH = 50/);
  assert.match(card, /s\("Name must be between 1 and \{max\} characters\."/);
  assert.match(card, /aria-invalid/);
  assert.match(card, /autoComplete="name"/);
});

test("report print surfaces use semantic theme colors", async () => {
  const chart = await read("components/pages/reports/charts/chart-shell.tsx");
  assert.doesNotMatch(chart, /print:bg-white/);
  assert.match(chart, /print:bg-\[var\(--surface-1\)\]/);
});

test("today regression follows the current employee textarea layout", async () => {
  const regression = await read("tests/today-polish-regression.test.ts");
  assert.match(regression, /grid content-center gap-3/);
  assert.match(regression, /Textarea rows/);
  assert.doesNotMatch(regression, /flex min-h-52 items-center/);
});
