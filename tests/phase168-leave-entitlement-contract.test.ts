import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { createInitialData, defaultSettings } from "../lib/constants.ts";
import { migrateAppData } from "../lib/data/migrations.ts";
import {
  LEGAL_ANNUAL_LEAVE_MINUTES,
  LEGAL_LEAVE_DAY_MINUTES,
  LEGAL_MONTHLY_LEAVE_MINUTES,
  calculateLeaveEntitlementSummary,
  getLeaveEntryUsedMinutes,
} from "../lib/leave-entitlement.ts";
import type { LeaveEntry } from "../lib/types.ts";

const root = process.cwd();
const referenceDate = "2026-08-09";

function leave(overrides: Partial<LeaveEntry> = {}): LeaveEntry {
  return {
    id: "leave-1",
    startDate: referenceDate,
    endDate: referenceDate,
    type: "full",
    minutes: 0,
    note: "",
    createdAt: "2026-08-09T08:00:00.000Z",
    ...overrides,
  };
}

test("legal leave baseline is 7:20 per day, 190:40 annually, and 15:53 monthly on display", () => {
  assert.equal(LEGAL_LEAVE_DAY_MINUTES, 7 * 60 + 20);
  assert.equal(LEGAL_ANNUAL_LEAVE_MINUTES, 190 * 60 + 40);
  assert.equal(LEGAL_MONTHLY_LEAVE_MINUTES * 12, LEGAL_ANNUAL_LEAVE_MINUTES);
  assert.equal(Math.round(LEGAL_MONTHLY_LEAVE_MINUTES), 15 * 60 + 53);
});

test("new users start with the legal monthly entitlement and no fake 26-hour opening balance", () => {
  assert.equal(defaultSettings.leaveBalanceMinutes, 0);
  assert.equal(defaultSettings.monthlyLeaveMinutes, LEGAL_MONTHLY_LEAVE_MINUTES);
});

test("legacy 26h plus 16h defaults are repaired without changing schema version", () => {
  const legacy = createInitialData({ onboarded: true });
  legacy.settings.leaveBalanceMinutes = 26 * 60;
  legacy.settings.monthlyLeaveMinutes = 16 * 60;

  const migrated = migrateAppData({ schemaVersion: 17, data: legacy }).data;
  assert.equal(migrated.settings.leaveBalanceMinutes, 0);
  assert.equal(migrated.settings.monthlyLeaveMinutes, LEGAL_MONTHLY_LEAVE_MINUTES);
});

test("full and half-day leave use each actual scheduled workday instead of the currently selected day", () => {
  const data = createInitialData({ onboarded: true });
  data.settings.autoOfficialHolidays = false;
  data.settings.autoWeeklyHoliday = false;

  assert.equal(getLeaveEntryUsedMinutes(leave(), data), 8 * 60);
  assert.equal(getLeaveEntryUsedMinutes(leave({ type: "half" }), data), 4 * 60);
  assert.equal(getLeaveEntryUsedMinutes(leave({ endDate: "2026-08-10" }), data), 16 * 60);
});

test("scheduled days off and explicit holidays do not consume daily leave entitlement", () => {
  const data = createInitialData({ onboarded: true });
  data.settings.autoOfficialHolidays = false;
  data.settings.autoWeeklyHoliday = false;
  data.holidayOverrides = [{ id: "holiday-1", date: "2026-08-10", title: "تعطیلی تست", kind: "manual", isHoliday: true }];

  assert.equal(getLeaveEntryUsedMinutes(leave({ startDate: "2026-08-13", endDate: "2026-08-13" }), data), 0);
  assert.equal(getLeaveEntryUsedMinutes(leave({ startDate: "2026-08-10", endDate: "2026-08-10" }), data), 0);
});

test("annual summary counts only entries in the current Jalali year and keeps carryover separate", () => {
  const data = createInitialData({ onboarded: true });
  data.settings.autoOfficialHolidays = false;
  data.settings.autoWeeklyHoliday = false;
  data.settings.leaveBalanceMinutes = 120;
  data.leaves = [
    leave({ id: "current", type: "hourly", minutes: 90 }),
    leave({ id: "old", startDate: "2025-08-09", endDate: "2025-08-09", type: "hourly", minutes: 180 }),
  ];

  const summary = calculateLeaveEntitlementSummary(data, referenceDate);
  assert.equal(summary.monthlyEntitlement, LEGAL_MONTHLY_LEAVE_MINUTES);
  assert.equal(summary.annualEntitlement, LEGAL_ANNUAL_LEAVE_MINUTES);
  assert.equal(summary.carryover, 120);
  assert.equal(summary.used, 90);
  assert.equal(summary.available, LEGAL_ANNUAL_LEAVE_MINUTES + 30);
});

test("leave overview no longer creates the old 42-hour total and explains the legal baseline", () => {
  const source = readFileSync(join(root, "components/pages/leave/leave-page.tsx"), "utf8");
  assert.doesNotMatch(source, /leaveBalanceMinutes\s*\+\s*data\.settings\.monthlyLeaveMinutes/);
  assert.match(source, /سهمیه ماهانه/);
  assert.match(source, /سهمیه سالانه/);
  assert.match(source, /۲۶ روز × ۷:۲۰ = ۱۹۰:۴۰/);
  assert.match(source, /تعطیلات رسمی، جمعه و روزهای غیرفعال برنامه کاری/);
});

test("Phase 168 is documented and wired into the main test command", () => {
  const pkg = readFileSync(join(root, "package.json"), "utf8");
  const roadmap = readFileSync(join(root, "docs/roadmap/BACKLOG_FA.md"), "utf8");
  const notes = readFileSync(join(root, "docs/phases/PHASE_168_NOTES_FA.md"), "utf8");
  assert.match(pkg, /phase168-leave-entitlement-contract\.test\.ts/);
  assert.match(roadmap, /\[x\] فاز ۱۶۸:/);
  assert.match(notes, /۷:۲۰ × ۲۶ ÷ ۱۲/);
  assert.match(notes, /651/);
});
