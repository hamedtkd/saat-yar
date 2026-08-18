import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { defaultSettings } from "../lib/constants.ts";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";
import {
  buildMonthActivityCells,
  buildRecentActivityDays,
  getActivityIntensity,
  summarizeMonthIntelligence,
  type MonthActivityCell,
} from "../lib/month-intelligence.ts";
import { makeWorkRecord } from "./fixtures/work-record.ts";

const read = (path: string) => readFileSync(path, "utf8");
const cell = (overrides: Partial<MonthActivityCell> = {}): MonthActivityCell => ({
  key: "2026-08-01",
  inMonth: true,
  worked: 0,
  leave: 0,
  credited: 0,
  target: 480,
  balance: 0,
  intensity: 0,
  hasRecord: false,
  ...overrides,
});

test("activity heatmap follows the active Persian or Gregorian calendar without storing a parallel calendar", () => {
  const gregorian = buildMonthActivityCells("2026-02-10", "gregory", [], defaultSettings);
  const persian = buildMonthActivityCells("2026-02-10", "persian", [], defaultSettings);
  assert.equal(gregorian.length, 42);
  assert.equal(persian.length, 42);
  assert.equal(gregorian.filter((item) => item.inMonth).length, 28);
  assert.equal(persian.filter((item) => item.inMonth).length, 30);
});

test("work intensity is derived from actual worked minutes against the real daily target", () => {
  assert.equal(getActivityIntensity(0, 480), 0);
  assert.equal(getActivityIntensity(60, 480), 1);
  assert.equal(getActivityIntensity(180, 480), 2);
  assert.equal(getActivityIntensity(420, 480), 3);
  assert.equal(getActivityIntensity(540, 480), 4);
  assert.equal(getActivityIntensity(30, 0), 4);
});

test("month intelligence reports active-day streaks and overtime deficit distribution", () => {
  const summary = summarizeMonthIntelligence([
    cell({ key: "2026-08-01", worked: 480, balance: 0, intensity: 3, hasRecord: true }),
    cell({ key: "2026-08-02", worked: 540, balance: 60, intensity: 4, hasRecord: true }),
    cell({ key: "2026-08-03", worked: 420, balance: -60, intensity: 3, hasRecord: true }),
    cell({ key: "2026-08-04" }),
    cell({ key: "2026-08-05", worked: 600, balance: 120, intensity: 4, hasRecord: true }),
  ]);
  assert.equal(summary.activeDays, 4);
  assert.equal(summary.longestStreak, 3);
  assert.equal(summary.overtimeDays, 2);
  assert.equal(summary.overtimeMinutes, 180);
  assert.equal(summary.deficitDays, 1);
  assert.equal(summary.deficitMinutes, 60);
  assert.equal(summary.balancedDays, 1);
  assert.equal(summary.bestDay?.key, "2026-08-05");
});

test("activity cells reuse the canonical schedule and time engine instead of inventing month totals", () => {
  const record = makeWorkRecord({ date: "2026-02-09", start: "07:30", end: "16:15", lunchMinutes: 45 });
  const cells = buildMonthActivityCells("2026-02-10", "gregory", [record], defaultSettings);
  const activity = cells.find((item) => item.key === record.date);
  assert.ok(activity);
  assert.equal(activity.hasRecord, true);
  assert.equal(activity.worked, 480);
  assert.equal(activity.target, 480);
  assert.equal(activity.balance, 0);
  assert.equal(activity.intensity, 3);

  const recent = buildRecentActivityDays("2026-02-10", "gregory", [record], defaultSettings, 3, "2026-02-10");
  assert.deepEqual(recent.map((item) => item.key), ["2026-02-10", "2026-02-09", "2026-02-08"]);
  assert.equal(recent[1]?.worked, 480);
  assert.equal(recent[1]?.target, 480);
  assert.equal(recent[1]?.hasRecord, true);
});

test("Month exposes a keyboard-accessible activity heatmap and bilingual month intelligence", () => {
  const heatmap = read("components/pages/month/activity-heatmap/activity-heatmap.tsx");
  const recent = read("components/pages/month/activity-heatmap/recent-activity-card.tsx");
  const intelligence = read("components/pages/month/activity-heatmap/month-intelligence-card.tsx");
  const monthPage = read("components/pages/month/month-page.tsx");
  const en = read("lib/i18n/en.ts");
  const fa = read("lib/i18n/fa.ts");
  assert.match(heatmap, /data-month-activity-heatmap/);
  assert.match(heatmap, /role="grid"/);
  assert.match(heatmap, /role="gridcell"/);
  assert.match(heatmap, /ArrowDown/);
  assert.match(heatmap, /ArrowRight/);
  assert.match(heatmap, /addEventListener\("focusin"/);
  assert.match(heatmap, /onFocus=/);
  assert.match(heatmap, /onBlur=/);
  assert.match(heatmap, /data-activity-tooltip-id/);
  assert.match(recent, /data-month-recent-activity/);
  assert.match(recent, /buildRecentActivityDays/);
  assert.match(intelligence, /data-month-intelligence/);
  assert.match(monthPage, /ActivityHeatmap/);
  assert.match(monthPage, /data-month-overview-section/);
  assert.match(monthPage, /data-month-intelligence-section/);
  assert.ok(monthPage.indexOf('data-month-overview-section') < monthPage.indexOf('data-month-intelligence-section'));
  assert.match(monthPage, /grid items-stretch grid-cols-\[minmax\(340px,.95fr\)_minmax\(300px,.78fr\)_minmax\(340px,1fr\)\]/);
  assert.match(monthPage, /RecentActivityCard/);
  assert.match(heatmap, /flex h-full[\s\S]*AnalyticsCardHeader/);
  assert.match(intelligence, /flex h-full[\s\S]*AnalyticsCardHeader/);
  assert.match(en, /Activity map and month intelligence/);
  assert.match(fa, /نقشه فعالیت و هوشمندی ماه/);
});

test("Phase 185 stays derived-only on schema v19 and is wired into docs quality and browser contracts", () => {
  assert.ok(APP_DATA_SCHEMA_VERSION >= 19);
  const types = read("lib/types.ts");
  assert.doesNotMatch(types, /monthIntelligence|activityHeatmap/);
  const packageJson = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
  assert.match(packageJson.scripts.test, /tests\/phase185-month-activity-intelligence\.test\.ts/);
  const docs = read("docs/phases/PHASE_185_NOTES_FA.md");
  assert.match(docs, /Schema v19/);
  assert.match(docs, /Persian\/Gregorian/);
  const smoke = read("scripts/production-browser-smoke.mjs");
  assert.match(smoke, /data-month-activity-heatmap/);
  assert.match(smoke, /keyboard-accessible month activity heatmap/);
  assert.match(smoke, /data-activity-tooltip/);
  assert.match(smoke, /Input\.dispatchMouseEvent/);
  assert.match(smoke, /pointer hover/);
  assert.match(smoke, /keyboard target did not receive focus/);
  assert.match(smoke, /data-month-recent-activity/);
});
