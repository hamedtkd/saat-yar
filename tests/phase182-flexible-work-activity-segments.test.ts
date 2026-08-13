import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { closeActiveActivitySegments, getActivityBreakdown } from "../lib/activity-segments.ts";
import { createInitialData } from "../lib/constants.ts";
import { migrateAppData } from "../lib/data/migrations.ts";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";
import type { WorkRecord } from "../lib/types.ts";
import {
  applyScheduleDayToEnabledDays,
  applyWeeklyTargetHours,
  getScheduleTargetMinutes,
} from "../lib/work-schedule.ts";
import { makeWorkRecord } from "./fixtures/work-record.ts";

const read = (path: string) => readFileSync(path, "utf8");

test("schema v18 migrates released v17 data into flexible-work and activity contracts safely", () => {
  assert.equal(APP_DATA_SCHEMA_VERSION, 18);
  const current = createInitialData({ onboarded: true });
  const legacy = structuredClone(current) as unknown as Record<string, unknown>;
  const settings = legacy.settings as Record<string, unknown>;
  delete settings.workTimingMode;
  const weeklySchedule = settings.weeklySchedule as Record<string, Record<string, unknown>>;
  for (const schedule of Object.values(weeklySchedule)) delete schedule.targetMinutes;
  const record = makeWorkRecord({ date: "2026-08-12" });
  const legacyRecord = { ...record } as unknown as Record<string, unknown>;
  delete legacyRecord.activitySegments;
  legacy.records = { "2026-08-12": legacyRecord };
  legacy.deletedRecords = [{ id: "deleted-1", date: "2026-08-11", record: { ...legacyRecord, date: "2026-08-11" }, deletedAt: "2026-08-12T00:00:00.000Z", expiresAt: "2026-09-11T00:00:00.000Z" }];

  const result = migrateAppData({ schemaVersion: 17, data: legacy });
  assert.equal(result.toVersion, 18);
  assert.equal(result.data.settings.workTimingMode, "scheduled", "v17 users keep their released fixed-schedule behavior");
  assert.equal(result.data.settings.weeklySchedule.saturday.targetMinutes, 480);
  assert.deepEqual(result.data.records["2026-08-12"].activitySegments, []);
  assert.deepEqual(result.data.deletedRecords[0].record.activitySegments, []);
});

test("flexible daily targets stay independent from fixed start and end clock values", () => {
  const settings = createInitialData().settings;
  settings.workTimingMode = "flexible";
  const beforeTimes = Object.fromEntries(Object.entries(settings.weeklySchedule).map(([day, value]) => [day, [value.start, value.end]]));
  const updated = applyWeeklyTargetHours(settings, 35);
  assert.equal(updated.weeklyMinutes, 35 * 60);
  assert.equal(getScheduleTargetMinutes({ ...updated.weeklySchedule.saturday, start: "03:00", end: "23:00" }, "flexible"), updated.weeklySchedule.saturday.targetMinutes);
  for (const [day, schedule] of Object.entries(updated.weeklySchedule)) {
    assert.deepEqual([schedule.start, schedule.end], beforeTimes[day]);
  }
});

test("applying a flexible day copies target and pause defaults without rewriting fixed times or days off", () => {
  const settings = createInitialData().settings;
  settings.workTimingMode = "flexible";
  settings.weeklySchedule.saturday = { ...settings.weeklySchedule.saturday, start: "06:00", end: "18:00", targetMinutes: 390, lunchMinutes: 20, lunchPaid: true };
  settings.weeklySchedule.sunday = { ...settings.weeklySchedule.sunday, start: "10:00", end: "19:00", targetMinutes: 510, lunchMinutes: 45, lunchPaid: false };
  const fridayBefore = structuredClone(settings.weeklySchedule.friday);
  const updated = applyScheduleDayToEnabledDays(settings, "saturday");
  assert.equal(updated.weeklySchedule.sunday.targetMinutes, 390);
  assert.equal(updated.weeklySchedule.sunday.lunchMinutes, 20);
  assert.equal(updated.weeklySchedule.sunday.lunchPaid, true);
  assert.equal(updated.weeklySchedule.sunday.start, "10:00");
  assert.equal(updated.weeklySchedule.sunday.end, "19:00");
  assert.deepEqual(updated.weeklySchedule.friday, fridayBefore);
});

test("activity segments close deterministically and aggregate by activity kind", () => {
  const base = makeWorkRecord({
    date: "2026-08-12",
    activitySegments: [
      { id: "deep", kind: "deep-work", start: "08:00", end: "09:30", startedAt: "2026-08-12T08:00:00.000Z", endedAt: "2026-08-12T09:30:00.000Z" },
      { id: "meeting", kind: "meeting", start: "10:00", end: "", startedAt: "2026-08-12T10:00:00.000Z" },
    ],
  });
  const closed = closeActiveActivitySegments(base.activitySegments, "10:45", "2026-08-12T10:45:00.000Z");
  const record: WorkRecord = { ...base, activitySegments: closed };
  assert.equal(closed[1].end, "10:45");
  const breakdown = getActivityBreakdown([record], new Date("2026-08-12T11:00:00.000Z"));
  assert.equal(breakdown.totals["deep-work"], 90);
  assert.equal(breakdown.totals.meeting, 45);
  assert.equal(breakdown.totalMinutes, 135);
});

test("Settings Today and Reports expose the flexible-work activity flow", () => {
  const settings = read("components/pages/settings/work-settings-card.tsx");
  const schedule = read("components/pages/settings/work-schedule-editor.tsx");
  const onboarding = read("components/layout/onboarding/schedule-step.tsx");
  const today = read("components/pages/today/activity-segments-card.tsx");
  const reports = read("components/pages/reports/overview/activity-breakdown.tsx");
  const reportTable = read("components/pages/reports/table/report-table-shared.tsx");
  const reportDesktop = read("components/pages/reports/table/employee-desktop-table.tsx");
  const reportChart = read("components/pages/reports/charts/use-employee-chart-data.ts");
  const attendance = read("hooks/controller/use-attendance-actions.ts");
  const shell = read("components/saatyar-shell.tsx");
  const header = read("components/layout/app-header.tsx");
  const mobileNav = read("components/layout/navigation/mobile-bottom-nav.tsx");
  const browserSmoke = read("scripts/production-browser-smoke.mjs");
  assert.match(settings, /data-work-timing-mode/);
  assert.match(schedule, /Daily target/);
  assert.match(schedule, /data-apply-schedule-source/);
  assert.match(onboarding, /data-onboarding-work-timing/);
  assert.match(onboarding, /Flexible schedule/);
  assert.match(today, /data-activity-segments/);
  assert.match(today, /data-start-activity-segment/);
  assert.match(reports, /data-activity-breakdown/);
  assert.match(reportTable, /getDailyTargetMinutes\(record\.date, settings\)/);
  assert.match(reportDesktop, /getDailyTargetMinutes\(record\.date, settings\)/);
  assert.match(reportChart, /getDailyTargetMinutes\(record\.date, settings\)/);
  assert.match(attendance, /startActivitySegment/);
  assert.match(attendance, /closeActiveActivitySegments/);
  assert.match(shell, /overflow-x-clip/);
  assert.match(header, /max-\[520px\]:hidden/);
  assert.match(mobileNav, /data-mobile-bottom-nav/);
  assert.match(mobileNav, /w-\[calc\(100vw-16px\)\]/);
  assert.match(browserSmoke, /assertMobileShellFits/);
  assert.match(browserSmoke, /width: 425, height: 608/);
  assert.match(browserSmoke, /data-onboarding-work-timing/);
  assert.match(browserSmoke, /workTimingMode === "flexible"/);
  assert.match(browserSmoke, /data-activity-segments/);
  assert.match(browserSmoke, /data-activity-breakdown/);
});

test("Phase 182 advances development to schema v18 while the released 2.4.0 contract stays immutable", () => {
  const packageJson = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
  const manifest = JSON.parse(read("docs/releases/2.4.0.json")) as { dataSchemaVersion: number; status: string; tag: string };
  const backlog = read("docs/roadmap/BACKLOG_FA.md");
  const audit = read("scripts/release-audit.mjs");
  assert.equal(manifest.dataSchemaVersion, 17);
  assert.equal(manifest.status, "released");
  assert.equal(manifest.tag, "v2.4.0");
  assert.match(audit, /APP_DATA_SCHEMA_VERSION >= manifest\.dataSchemaVersion/);
  assert.match(backlog, /\[x\] فاز ۱۸۲:/);
  assert.match(packageJson.scripts.test, /tests\/phase182-flexible-work-activity-segments\.test\.ts/);
});
