import assert from "node:assert/strict";
import test from "node:test";
import { closePreviousRecordForNewDay, findPreviousOpenRecord } from "../lib/previous-day-session.ts";
import { initialData } from "../lib/constants.ts";
import { makeWorkRecord } from "./fixtures/work-record.ts";

const record = (date: string, end = "") => makeWorkRecord({
  date,
  start: "07:40",
  end,
  lunchMinutes: 30,
});

test("finds the latest unfinished record before a new work day", () => {
  const records = {
    "2026-08-03": record("2026-08-03"),
    "2026-08-04": record("2026-08-04", "16:00"),
    "2026-08-05": record("2026-08-05"),
  };
  assert.equal(findPreviousOpenRecord(records, "2026-08-06")?.date, "2026-08-05");
});

test("does not block when every previous record has an exit", () => {
  const records = { "2026-08-05": record("2026-08-05", "16:00") };
  assert.equal(findPreviousOpenRecord(records, "2026-08-06"), undefined);
});

test("auto-closes the previous day with its configured schedule and review state", () => {
  const closed = closePreviousRecordForNewDay(record("2026-08-05"), initialData.settings, new Date("2026-08-06T05:00:00.000Z"));
  assert.ok(closed.end);
  assert.equal(closed.autoClosedReason, "day-rollover");
  assert.equal(closed.needsReview, true);
});
