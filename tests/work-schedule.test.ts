import assert from "node:assert/strict";
import test from "node:test";
import { defaultSettings } from "../lib/constants.ts";
import {
  getDailyTargetMinutes,
  getScheduleTargetMinutes,
  getWeeklyTargetMinutes,
  getWeekdayKey,
} from "../lib/work-schedule.ts";

test("maps Gregorian dates to the Persian work-week keys", () => {
  assert.equal(getWeekdayKey("2026-08-01"), "saturday");
  assert.equal(getWeekdayKey("2026-08-07"), "friday");
});

test("calculates an independent target for each weekday", () => {
  const settings = structuredClone(defaultSettings);
  settings.weeklySchedule.thursday = {
    enabled: true,
    start: "08:00",
    end: "13:00",
    lunchMinutes: 0,
  };

  assert.equal(getDailyTargetMinutes("2026-08-06", settings), 300);
  assert.equal(getDailyTargetMinutes("2026-08-07", settings), 0);
});

test("supports shifts that cross midnight", () => {
  assert.equal(
    getScheduleTargetMinutes({
      enabled: true,
      start: "22:00",
      end: "06:00",
      lunchMinutes: 30,
    }),
    450,
  );
});

test("derives the weekly target from enabled days", () => {
  assert.equal(getWeeklyTargetMinutes(defaultSettings), 5 * 480);
});
