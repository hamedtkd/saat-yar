import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("historical record drafts register with the global unsaved navigation registry", async () => {
  const source = await read("components/pages/today/completed-day-editor.tsx");
  assert.match(source, /registerSettingsDraft/);
  assert.match(source, /dirty: completed && editing && dirty/);
  assert.match(source, /save: saveEdit/);
  assert.match(source, /discard: cancelEdit/);
  assert.match(source, /t\("today\.edit\.registryLabel"/);
});

test("date changes pass through the global unsaved navigation guard", async () => {
  const source = await read("components/pages/today/today-page.tsx");
  assert.match(source, /useUnsavedNavigation/);
  assert.match(source, /onDateChange=\{\(nextDate\) => requestNavigation\(\(\) => props\.setSelectedDate\(nextDate\)\)\}/);
});

test("unsaved dialog wording covers section and date navigation", async () => {
  const source = await read("components/pages/settings/unsaved-settings-guard.tsx");
  assert.match(source, /s\("Before moving to another section or date, save your edits or continue without saving\."\)/);
});
