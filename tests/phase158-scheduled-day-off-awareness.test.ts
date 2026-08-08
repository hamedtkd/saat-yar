import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { defaultSettings } from "../lib/constants.ts";
import { getHolidayInfo } from "../lib/holidays.ts";
import { getDailyTargetMinutes, isScheduledDayOff } from "../lib/work-schedule.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const SATURDAY_1405_05_17 = "2026-08-08";

function settingsWithSaturdayOff() {
  const settings = structuredClone(defaultSettings);
  settings.weeklySchedule.saturday.enabled = false;
  return settings;
}

test("disabled weekly schedule days are explicit scheduled days off with zero target", () => {
  const settings = settingsWithSaturdayOff();

  assert.equal(isScheduledDayOff(SATURDAY_1405_05_17, settings), true);
  assert.equal(getDailyTargetMinutes(SATURDAY_1405_05_17, settings), 0);
});

test("scheduled days off stay separate from official and weekly holiday payroll semantics", () => {
  const holiday = getHolidayInfo(SATURDAY_1405_05_17, {
    mode: "employee",
    includeOfficialHolidays: true,
    includeWeeklyHoliday: true,
  });

  assert.equal(holiday.isHoliday, false);
  assert.equal(holiday.kind, undefined);
});

test("today hero announces the configured day off and gives the picker the weekly schedule", async () => {
  const hero = await read("components/pages/today/today-hero.tsx");

  assert.match(hero, /isScheduledDayOff\(selectedDate, data\.settings\)/);
  assert.match(hero, /امروز طبق برنامه کاری تعطیل است/);
  assert.match(hero, /این روز طبق برنامه کاری تعطیل است/);
  assert.match(hero, /weeklySchedule=\{data\.settings\.weeklySchedule\}/);
});

test("today surfaces describe a scheduled day off instead of a generic zero-target day", async () => {
  const [page, summary, metrics] = await Promise.all([
    read("components/pages/today/today-page.tsx"),
    read("components/pages/today/today-smart-summary.tsx"),
    read("components/pages/today/today-metrics.tsx"),
  ]);

  assert.match(page, /امروز طبق برنامه کاری تعطیل است/);
  assert.match(page, /ساعت موظفی: صفر/);
  assert.match(summary, /تعطیل طبق برنامه کاری/);
  assert.match(summary, /کار استثنایی در روز تعطیل/);
  assert.match(metrics, /تعطیل طبق برنامه/);
  assert.match(metrics, /ساعت موظفی صفر/);
});

test("attendance controls keep exceptional work possible without presenting the day as normal", async () => {
  const [focus, inputs] = await Promise.all([
    read("components/pages/today/today-focus-card.tsx"),
    read("components/pages/today/time-strip/time-inputs.tsx"),
  ]);

  assert.match(focus, /تعطیل طبق برنامه کاری/);
  assert.match(focus, /در صورت نیاز می‌توانی کار استثنایی ثبت کنی/);
  assert.match(focus, /بدون ساعت خروج موظفی/);
  assert.match(focus, /با این حال شروع روز/);
  assert.match(inputs, /ثبت ورود استثنایی/);
  assert.match(inputs, /scheduledDayOff \? \[\] :/);
});

test("jalali calendar marks scheduled days off separately from official holidays", async () => {
  const [picker, types, day] = await Promise.all([
    read("components/pickers/jalali-date-picker.tsx"),
    read("components/pickers/jalali-date-picker/types.ts"),
    read("components/pickers/jalali-date-picker/calendar-day.tsx"),
  ]);

  assert.match(types, /weeklySchedule\?: Settings\["weeklySchedule"\]/);
  assert.match(picker, /weeklySchedule,/);
  assert.match(day, /isScheduledDayOff/);
  assert.match(day, /تعطیل طبق برنامه کاری/);
  assert.match(day, /var\(--warning\)/);
  assert.match(day, /!holiday\.isHoliday/);
});
