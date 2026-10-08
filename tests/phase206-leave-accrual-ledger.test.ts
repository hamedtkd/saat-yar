import assert from "node:assert/strict";
import test from "node:test";

import { createInitialData } from "../lib/constants.ts";
import { APP_DATA_SCHEMA_VERSION } from "../lib/data/version.ts";
import { createAppDataSnapshot } from "../lib/data/snapshot.ts";
import { createBackupEnvelope, parseBackupEnvelope } from "../lib/backup-workflow.ts";
import { createDeviceTransferPayload, verifyDeviceTransferPayload } from "../lib/device-transfer-payload.ts";
import { calculateLeaveEntitlementSummary } from "../lib/leave-entitlement.ts";
import { appendLeaveAdjustment, appendLeaveCarryForward, calculateLeaveYearSummary, hasSettlementForYear, setMonthlyLeavePolicy, settleLeaveYear } from "../lib/leave-ledger.ts";
import type { LeaveEntry } from "../lib/types.ts";

const policy = { id: "policy-1405", effectiveYear: 1405, effectiveMonth: 1, monthlyMinutes: 16 * 60, createdAt: "2026-03-21T00:00:00.000Z" };

function dataFor1405() {
  const data = createInitialData({ onboarded: true });
  data.settings.leavePolicies = [policy];
  data.settings.leaveEvents = [];
  data.settings.autoOfficialHolidays = false;
  data.settings.autoWeeklyHoliday = false;
  data.leaves = [];
  return data;
}

function hourlyLeave(date: string, minutes: number, id = "leave") : LeaveEntry {
  return { id, startDate: date, endDate: date, type: "hourly", minutes, note: "", createdAt: `${date}T08:00:00.000Z` };
}

test("Farvardin grants 16 hours and annual maximum remains informational", () => {
  const summary = calculateLeaveEntitlementSummary(dataFor1405(), "2026-03-21");
  assert.equal(summary.accruedThisYear, 16 * 60);
  assert.equal(summary.available, 16 * 60);
  assert.equal(summary.annualEntitlement, 192 * 60);
});

test("Mehr has seven monthly grants and future Aban through Esfand are not available", () => {
  const data = dataFor1405();
  const mehr = calculateLeaveEntitlementSummary(data, "2026-09-23");
  const beforeAban = calculateLeaveEntitlementSummary(data, "2026-10-22");
  const aban = calculateLeaveEntitlementSummary(data, "2026-10-23");
  assert.equal(mehr.accruedThisYear, 112 * 60);
  assert.equal(beforeAban.accruedThisYear, 112 * 60);
  assert.equal(aban.accruedThisYear, 128 * 60);
  assert.deepEqual(mehr.monthlyBreakdown.slice(7).map((month) => month.accrued), [0, 0, 0, 0, 0]);
  assert.deepEqual(mehr.monthlyBreakdown.slice(7).map((month) => month.future), [true, true, true, true, true]);
});

test("Esfand receives the twelfth grant and policy continues once across 1405 to 1406", () => {
  const data = dataFor1405();
  assert.equal(calculateLeaveEntitlementSummary(data, "2027-03-20").accruedThisYear, 192 * 60);
  const nextYear = calculateLeaveEntitlementSummary(data, "2027-03-21");
  assert.equal(nextYear.year, 1406);
  assert.equal(nextYear.accruedThisYear, 16 * 60);
  assert.equal(calculateLeaveYearSummary(data, 1404, 12).accruedThisYear, 0);
});

test("dated policy changes apply from their Jalali month without rewriting prior months", () => {
  const data = setMonthlyLeavePolicy(dataFor1405(), 20 * 60, "2026-10-23");
  assert.equal(calculateLeaveEntitlementSummary(data, "2026-10-22").accruedThisYear, 112 * 60);
  assert.equal(calculateLeaveEntitlementSummary(data, "2026-10-23").accruedThisYear, 132 * 60);
  assert.equal(data.settings.monthlyLeaveMinutes, 20 * 60);
});

test("carry-forward credits destination once and mixed year settlement debits cash-out once", () => {
  const data = dataFor1405();
  data.settings.leavePolicies = [{ ...policy, effectiveYear: 1404, id: "policy-1404" }];
  const firstCarry = appendLeaveCarryForward(data, 1404, 20 * 60, "Opening balance");
  assert.ok(firstCarry);
  assert.equal(hasSettlementForYear(firstCarry.settings, 1404), true);
  assert.equal(appendLeaveCarryForward(firstCarry, 1404, 20 * 60, "Duplicate"), null);
  assert.equal(settleLeaveYear(firstCarry, 1404, 10 * 60, 0, "Duplicate settlement"), null);
  const settled = settleLeaveYear(firstCarry, 1405, 20 * 60, 10 * 60, "Year-end split");
  assert.ok(settled);
  assert.equal(settleLeaveYear(settled, 1405, 20 * 60, 10 * 60, "Repeat"), null);
  assert.equal(calculateLeaveYearSummary(settled, 1405, 12).available, 182 * 60);
  assert.equal(calculateLeaveYearSummary(settled, 1406, 1).carryover, 20 * 60);
  assert.equal(calculateLeaveYearSummary(settled, 1406, 1).available, 36 * 60);
});

test("positive and negative manual adjustments reconcile missing history without fake leave requests", () => {
  const positive = appendLeaveAdjustment(dataFor1405(), 90, "2026-09-23", "Unrecorded historical leave correction");
  const adjusted = appendLeaveAdjustment(positive, -30, "2026-09-23", "Previous system reconciliation");
  const summary = calculateLeaveEntitlementSummary(adjusted, "2026-09-23");
  assert.equal(adjusted.leaves.length, 0);
  assert.equal(summary.adjustments, 60);
  assert.equal(summary.available, 7 * 16 * 60 + 60);
  assert.equal(adjusted.settings.leaveEvents.length, 2);
});

test("recorded leave usage and edits/deletes recalculate the balance", () => {
  const data = dataFor1405();
  data.leaves = [hourlyLeave("2026-09-23", 90)];
  assert.equal(calculateLeaveEntitlementSummary(data, "2026-09-23").available, 7 * 16 * 60 - 90);
  data.leaves[0] = hourlyLeave("2026-09-23", 120);
  assert.equal(calculateLeaveEntitlementSummary(data, "2026-09-23").available, 7 * 16 * 60 - 120);
  data.leaves = [];
  assert.equal(calculateLeaveEntitlementSummary(data, "2026-09-23").available, 7 * 16 * 60);
});

test("year-end settlement records hours only and refuses to exceed the positive closing balance", () => {
  const data = dataFor1405();
  data.settings.leavePolicies = [{ ...policy, effectiveYear: 1404, id: "policy-1404" }];
  assert.equal(settleLeaveYear(data, 1404, 200 * 60, 0, "Too much"), null);
  const settled = settleLeaveYear(data, 1404, 0, 10 * 60, "Cash out in hours");
  assert.ok(settled);
  assert.equal(calculateLeaveYearSummary(settled, 1404, 12).cashOut, 10 * 60);
  assert.equal(calculateLeaveYearSummary(settled, 1404, 12).available, 182 * 60);
});

test("policy, ledger events, carry-forward, and settlements survive backup, snapshot, and device transfer", async () => {
  let data = dataFor1405();
  data = appendLeaveAdjustment(data, 75, "2026-09-23", "HR correction");
  const carried = appendLeaveCarryForward(data, 1404, 20 * 60, "Opening carry");
  assert.ok(carried);
  if (!carried) return;
  data = carried;
  const snapshot = createAppDataSnapshot(data, "2026-09-23T12:00:00.000Z");
  assert.equal(snapshot.schemaVersion, APP_DATA_SCHEMA_VERSION);
  assert.deepEqual(snapshot.data.settings.leavePolicies, data.settings.leavePolicies);
  assert.deepEqual(parseBackupEnvelope(createBackupEnvelope(data)).settings.leaveEvents, data.settings.leaveEvents);
  const payload = await createDeviceTransferPayload(data, { deviceId: "test-device", deviceName: "Test device" });
  const verified = await verifyDeviceTransferPayload(payload);
  assert.deepEqual(verified.data.settings.leavePolicies, data.settings.leavePolicies);
  assert.deepEqual(verified.data.settings.leaveEvents, data.settings.leaveEvents);
});
