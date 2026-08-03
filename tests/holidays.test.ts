import assert from "node:assert/strict";
import test from "node:test";
import { getHolidayInfo } from "../lib/holidays.ts";

test("manual holiday override takes priority over official calendar", () => {
  const result = getHolidayInfo("2026-03-21", {
    overrides: [{ id: "1", date: "2026-03-21", title: "روز کاری شرکت", kind: "company", isHoliday: false }],
  });
  assert.equal(result.isHoliday, false);
  assert.equal(result.title, "روز کاری شرکت");
});

test("manual company holiday can mark a normal day as holiday", () => {
  const result = getHolidayInfo("2026-08-03", {
    includeOfficialHolidays: false,
    includeWeeklyHoliday: false,
    overrides: [{ id: "2", date: "2026-08-03", title: "تعطیلی شرکت", kind: "company", isHoliday: true }],
  });
  assert.equal(result.isHoliday, true);
  assert.equal(result.source, "user");
});
