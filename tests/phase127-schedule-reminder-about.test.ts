import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { defaultSettings } from "../lib/constants.ts";
import { durationWords } from "../lib/format.ts";
import { applyWeeklyTargetHours, getScheduleTargetMinutes, weekdayOrder } from "../lib/work-schedule.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("53 weekly hours keep visible end times aligned with the 10h36 daily target", () => {
  const settings = structuredClone(defaultSettings);
  for (const day of weekdayOrder) {
    settings.weeklySchedule[day] = {
      ...settings.weeklySchedule[day],
      start: "07:30",
      lunchMinutes: 20,
    };
  }
  const next = applyWeeklyTargetHours(settings, 53);
  const enabled = weekdayOrder.filter((day) => next.weeklySchedule[day].enabled);

  assert.equal(enabled.length, 5);
  for (const day of enabled) {
    assert.equal(next.weeklySchedule[day].end, "18:26");
    assert.equal(getScheduleTargetMinutes(next.weeklySchedule[day]), 636);
  }
  assert.equal(next.weeklyMinutes, 53 * 60);
});

test("work schedule shows exact hour and minute wording instead of a misleading decimal", async () => {
  const editor = await read("components/pages/settings/work-schedule-editor.tsx");
  assert.equal(durationWords(636), "۱۰ ساعت و ۳۶ دقیقه");
  assert.match(editor, /durationWords\(getScheduleTargetMinutes\(schedule\)\)/);
  assert.match(editor, /کار خالص روز/);
  assert.match(editor, /weeklyMinutes: getWeeklyTargetMinutes/);
});

test("time picker remounts when a parent recalculates its controlled value", async () => {
  const picker = await read("components/pickers/time-picker.tsx");
  assert.match(picker, /<TimePickerSession key=\{props\.value\}/);
  assert.match(picker, /useTimePicker\(value, onChange, locale\)/);
});

test("break reminder toggle stays aligned with its own title instead of floating over the coffee icon", async () => {
  const card = await read("components/pages/settings/notification-settings-card.tsx");
  assert.match(card, /فعال‌کردن یادآوری استراحت/);
  assert.match(card, /justify-between/);
  assert.match(card, /<Coffee/);
  assert.match(card, /فقط هنگام ثبت کار/);
});

test("about page documents local-first usage and exposes the requested contact links", async () => {
  const [page, footer, metadata] = await Promise.all([
    read("components/pages/about/about-page.tsx"),
    read("components/layout/app-footer.tsx"),
    read("lib/site-metadata.ts"),
  ]);
  assert.match(page, /https:\/\/github\.com\/hamedtkd\/saat-yar/);
  assert.match(page, /https:\/\/daramet\.com\/hamedtkd/);
  assert.match(page, /https:\/\/www\.linkedin\.com\/in\/hamed-ahmadi1\//);
  assert.match(page, /https:\/\/t\.me\/hamed_tkd/);
  assert.match(footer, /href="\/about"/);
  assert.match(metadata, /ABOUT_METADATA/);
});

test("about is an allowed supplemental route and phase 126 lint warning is removed", async () => {
  const [navigation, guard, settingsModel] = await Promise.all([
    read("lib/navigation.ts"),
    read("components/layout/navigation/route-guard.tsx"),
    read("components/pages/settings/settings-navigation-model.ts"),
  ]);
  assert.match(navigation, /SUPPLEMENTAL_ROUTES = \["\/about", "\/import"\]/);
  assert.match(guard, /isSupplementalRoute\(normalized\)/);
  assert.doesNotMatch(settingsModel, /DatabaseBackup/);
});
