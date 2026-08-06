import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { initialData } from "../lib/constants.ts";
import { applyWeeklyTargetHours, getWeeklyTargetMinutes } from "../lib/work-schedule.ts";

test("weekly target helpers preserve structural draft types", () => {
  const draft = {
    weeklyMinutes: initialData.settings.weeklyMinutes,
    weeklySchedule: initialData.settings.weeklySchedule,
    marker: "draft" as const,
  };
  const next = applyWeeklyTargetHours(draft, 42.5);
  assert.equal(next.marker, "draft");
  assert.equal(getWeeklyTargetMinutes(next), 42.5 * 60);
});

test("read-only work schedule disables every editable control", async () => {
  const editor = await readFile(new URL("../components/pages/settings/work-schedule-editor.tsx", import.meta.url), "utf8");
  const picker = await readFile(new URL("../components/pickers/time-picker.tsx", import.meta.url), "utf8");
  const duration = await readFile(new URL("../components/common/minute-duration-field.tsx", import.meta.url), "utf8");
  assert.match(editor, /TimePicker disabled=\{disabled\}/);
  assert.match(editor, /MinuteDurationField disabled=\{disabled\}/);
  assert.match(picker, /disabled = false/);
  assert.match(duration, /disabled = false/);
});
