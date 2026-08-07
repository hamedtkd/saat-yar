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
  assert.match(source, /ویرایش رکورد/);
});

test("date changes pass through the global unsaved navigation guard", async () => {
  const source = await read("components/pages/today/today-page.tsx");
  assert.match(source, /useUnsavedNavigation/);
  assert.match(source, /onDateChange=\{\(date\) => requestNavigation\(\(\) => props\.setSelectedDate\(date\)\)\}/);
});

test("unsaved dialog wording covers section and date navigation", async () => {
  const source = await read("components/pages/settings/unsaved-settings-guard.tsx");
  assert.match(source, /بخش یا تاریخ دیگر/);
});
