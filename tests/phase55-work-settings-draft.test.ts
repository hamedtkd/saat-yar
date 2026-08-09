import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("work settings use manual draft edit save and cancel actions", async () => {
  const source = await readFile("components/pages/settings/work-settings-card.tsx", "utf8");
  assert.match(source, /useSettingsDraft/);
  assert.match(source, /EditableCardActions/);
  assert.match(source, /disabled=\{!canEdit\}/);
  assert.match(source, /تنظیمات کاری ذخیره شد/);
  assert.doesNotMatch(source, /onModeChange/);
});

test("weekly schedule edits remain inside the work settings draft", async () => {
  const source = await readFile("components/pages/settings/work-schedule-editor.tsx", "utf8");
  assert.match(source, /applyWeeklyTargetHours\(value, hours\)/);
  assert.match(source, /onChange\(\{/);
  assert.match(source, /weeklySchedule(?:\s*:|,)/);
});

test("settings sticky regression follows the header-safe offset", async () => {
  const testSource = await readFile("tests/phase52-dashboard-report-polish.test.ts", "utf8");
  assert.match(testSource, /top-\\\[84px\\\]/);
  assert.doesNotMatch(testSource, /sticky top-5/);
});
