import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { createInitialData, defaultSettings } from "../lib/constants.ts";
import { migrateAppData } from "../lib/data/migrations.ts";
import {
  DEFAULT_MONTHLY_LEAVE_MINUTES,
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

test("new users start with an exact 16-hour monthly policy and no invented opening balance", () => {
  assert.equal(defaultSettings.leaveBalanceMinutes, 0);
  assert.equal(defaultSettings.monthlyLeaveMinutes, DEFAULT_MONTHLY_LEAVE_MINUTES);
  assert.equal(defaultSettings.leavePolicies[0].monthlyMinutes, 16 * 60);
});

test("v21 migration preserves the stored monthly policy and starts a Jalali-year policy record", () => {
  const legacy = createInitialData({ onboarded: true });
  legacy.settings.leaveBalanceMinutes = 26 * 60;
  legacy.settings.monthlyLeaveMinutes = LEGAL_MONTHLY_LEAVE_MINUTES;

  const migrated = migrateAppData({ schemaVersion: 21, data: legacy }).data;
  assert.equal(migrated.settings.leaveBalanceMinutes, 26 * 60);
  assert.equal(migrated.settings.monthlyLeaveMinutes, Math.round(LEGAL_MONTHLY_LEAVE_MINUTES));
  assert.equal(migrated.settings.leavePolicies.length, 1);
  assert.equal(migrated.settings.leavePolicies[0].effectiveMonth, 1);
  assert.equal(migrated.settings.leaveEvents.length, 0);
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

test("summary accrues by Jalali month, counts current-year usage, and keeps carryover separate", () => {
  const data = createInitialData({ onboarded: true });
  data.settings.autoOfficialHolidays = false;
  data.settings.autoWeeklyHoliday = false;
  data.settings.leavePolicies = [{ id: "policy-1405", effectiveYear: 1405, effectiveMonth: 1, monthlyMinutes: 16 * 60, createdAt: "2026-03-21T00:00:00.000Z" }];
  data.settings.leaveEvents = [{ id: "carry-1404", type: "carry-forward", sourceYear: 1404, destinationYear: 1405, minutes: 120, note: "", createdAt: "2026-03-21T00:00:00.000Z" }];
  data.leaves = [
    leave({ id: "current", type: "hourly", minutes: 90 }),
    leave({ id: "old", startDate: "2025-08-09", endDate: "2025-08-09", type: "hourly", minutes: 180 }),
  ];

  const summary = calculateLeaveEntitlementSummary(data, referenceDate);
  assert.equal(summary.monthlyEntitlement, 16 * 60);
  assert.equal(summary.annualEntitlement, 16 * 60 * 12);
  assert.equal(summary.accruedThisYear, 5 * 16 * 60);
  assert.equal(summary.carryover, 120);
  assert.equal(summary.used, 90);
  assert.equal(summary.available, 5 * 16 * 60 + 30);
});

test("leave overview separates accrued-to-date from the annual policy maximum and offers a ledger", () => {
  const source = readFileSync(join(root, "components/pages/leave/leave-page.tsx"), "utf8");
  const catalog = readFileSync(join(root, "lib/i18n/business.ts"), "utf8");
  assert.doesNotMatch(source, /leaveBalanceMinutes\s*\+\s*data\.settings\.monthlyLeaveMinutes/);
  assert.match(source, /b\("leave\.metrics\.monthly"\)/);
  assert.match(source, /b\("leave\.metrics\.annual"\)/);
  assert.match(source, /b\("leave\.metrics\.accrued"\)/);
  assert.match(source, /LeaveAccrualPanel/);
  assert.match(source, /b\("leave\.overview\.description"\)/);
  assert.match(source, /b\("leave\.overview\.note"\)/);
  assert.match(catalog, /"leave\.metrics\.monthly": "سهمیه ماهانه"/);
  assert.match(catalog, /"leave\.metrics\.annual": "سقف سیاست سالانه"/);
  assert.match(catalog, /"leave\.ledger\.accrued": "تعلق ماه"/);
  assert.match(catalog, /تعطیلات رسمی، جمعه و روزهای غیرفعال برنامه کاری/);
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
