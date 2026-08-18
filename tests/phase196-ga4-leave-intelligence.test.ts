import assert from "node:assert/strict";
import test from "node:test";
import { createInitialData } from "../lib/constants.ts";
import { getDailyTargetMinutes } from "../lib/work-schedule.ts";
import { getEffectiveWorkRecordForDate } from "../lib/leave-entitlement.ts";
import { calc } from "../lib/time-engine.ts";
import { buildMonthActivityCells, buildRecentActivityDays, summarizeMonthIntelligence } from "../lib/month-intelligence.ts";
import { getGa4ConsentDefaults, resolveProductAnalyticsConsentValue } from "../lib/product-analytics.ts";

test("configured analytics defaults to enabled while an explicit opt-out remains authoritative", () => {
  assert.equal(resolveProductAnalyticsConsentValue(null), "granted");
  assert.equal(resolveProductAnalyticsConsentValue("granted"), "granted");
  assert.equal(resolveProductAnalyticsConsentValue("denied"), "denied");
  const defaults = getGa4ConsentDefaults();
  assert.equal(defaults[0].analytics_storage, "granted");
  assert.equal(defaults[0].ad_storage, "denied");
  assert.equal(defaults[0].ad_user_data, "denied");
  assert.equal(defaults[0].ad_personalization, "denied");
  assert.equal(defaults[1].analytics_storage, "denied");
  assert.ok(defaults[1].region.includes("GB"));
  assert.ok(defaults[1].region.includes("DE"));
});

test("a registered full-day leave credits the daily target without inventing worked minutes", () => {
  const data = createInitialData({ onboarded: true });
  const date = "2026-08-17";
  const target = getDailyTargetMinutes(date, data.settings);
  assert.ok(target > 0);
  data.leaves.push({ id: "leave-full", startDate: date, endDate: date, type: "full", minutes: 0, note: "", createdAt: "2026-08-17T00:00:00.000Z" });
  const record = getEffectiveWorkRecordForDate(date, data);
  const result = calc(record, target);
  assert.equal(result.worked, 0);
  assert.equal(result.leave, target);
  assert.equal(result.credited, target);
  assert.equal(result.balance, 0);
});

test("month intelligence and recent activity split work from leave and do not count covered leave as deficit", () => {
  const data = createInitialData({ onboarded: true });
  const date = "2026-08-17";
  const target = getDailyTargetMinutes(date, data.settings);
  data.records[date] = { ...getEffectiveWorkRecordForDate(date, data), start: "07:30", end: "11:30", lunchMinutes: 0, lunchPaid: true, manuallyEdited: true };
  data.leaves.push({ id: "leave-half", startDate: date, endDate: date, type: "half", minutes: 0, note: "", createdAt: "2026-08-17T00:00:00.000Z" });
  const effective = getEffectiveWorkRecordForDate(date, data);
  const result = calc(effective, target);
  assert.equal(result.leave, target / 2);
  assert.equal(result.worked, 240);
  assert.equal(result.balance, 0);

  const recent = buildRecentActivityDays(date, "gregory", data, 1, date);
  assert.equal(recent[0]?.worked, 240);
  assert.equal(recent[0]?.leave, target / 2);
  assert.equal(recent[0]?.balance, 0);

  const summary = summarizeMonthIntelligence(buildMonthActivityCells(date, "gregory", data));
  assert.equal(summary.workedMinutes, 240);
  assert.equal(summary.leaveMinutes, target / 2);
  assert.equal(summary.leaveDays, 1);
  assert.equal(summary.deficitMinutes, 0);
});
