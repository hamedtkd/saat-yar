import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { initialData } from "../lib/constants.ts";
import { applyWeeklyTargetHours, getWeeklyTargetMinutes } from "../lib/work-schedule.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("weekly target redistributes over enabled days from current settings", () => {
  const settings = applyWeeklyTargetHours(initialData.settings, 50);
  assert.equal(getWeeklyTargetMinutes(settings), 50 * 60);
  assert.equal(settings.weeklyMinutes, 50 * 60);
  assert.notEqual(settings.weeklySchedule.sunday.end, initialData.settings.weeklySchedule.sunday.end);
});

test("disabled days stay unchanged when weekly target changes", () => {
  const before = initialData.settings.weeklySchedule.friday;
  const settings = applyWeeklyTargetHours(initialData.settings, 45);
  assert.deepEqual(settings.weeklySchedule.friday, before);
});

test("settings cards use structured responsive surfaces", async () => {
  const notification = await read("components/pages/settings/notification-settings-card.tsx");
  const work = await read("components/pages/settings/work-settings-card.tsx");
  const schedule = await read("components/pages/settings/work-schedule-editor.tsx");
  assert.match(notification, /lg:grid-cols-\[1\.1fr_1fr_1fr\]/);
  assert.match(notification, /bg-\[var\(--accent-soft\)\]/);
  assert.match(schedule, /applyWeeklyTargetHours\(value, hours\)/);
  assert.match(schedule, /md:grid-cols-\[1fr_auto\]/);
  assert.match(work, /WorkScheduleEditor/);
});

test("manual settings editing is captured in the backlog", async () => {
  const backlog = await read("docs/roadmap/BACKLOG_FA.md");
  assert.match(backlog, /دکمه مداد/);
  assert.match(backlog, /ذخیره خودکار به‌صورت پیش‌فرض خاموش/);
  assert.match(backlog, /ذخیره.*انصراف/);
});
