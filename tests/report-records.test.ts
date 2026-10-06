import assert from "node:assert/strict";
import test from "node:test";

import { createInitialData } from "../lib/constants.ts";
import { recordMatchesReportFilter } from "../lib/report-filters.ts";
import { selectReportRecords } from "../lib/report-records.ts";
import { createReportSummary } from "../lib/report-summary.ts";
import type { AppData, ReportFilter, WorkRecord } from "../lib/types.ts";
import { makeWorkRecord } from "./fixtures/work-record.ts";

const baseFilter: ReportFilter = {
  clientId: "all",
  projectId: "all",
  billable: "all",
  query: "",
  dateFrom: "",
  dateTo: "",
  status: "all",
};

function employeeData(): AppData {
  const data = createInitialData({ onboarded: true });
  data.settings.mode = "employee";
  data.settings.autoOfficialHolidays = false;
  data.settings.autoWeeklyHoliday = false;
  for (const day of Object.values(data.settings.weeklySchedule)) {
    day.enabled = true;
    day.targetMinutes = 480;
  }
  return data;
}

function addRecord(data: AppData, date: string, overrides: Partial<WorkRecord> = {}): WorkRecord {
  const record = makeWorkRecord({ date, ...overrides });
  data.records[date] = record;
  return record;
}

function addHoliday(data: AppData, date: string): void {
  data.holidayOverrides.push({ id: `holiday-${date}`, date, title: "تعطیلی آزمایشی", kind: "manual", isHoliday: true });
}

test("regression: a report range from an earlier month still returns that month's records", () => {
  const data = employeeData();
  addRecord(data, "2026-09-10");
  addRecord(data, "2026-10-10");

  const records = selectReportRecords(data, { ...baseFilter, dateFrom: "2026-09-01", dateTo: "2026-09-30" });

  assert.deepEqual(records.map((record) => record.date), ["2026-09-10"]);
});

test("regression: a cross-month range returns every matching record exactly once", () => {
  const data = employeeData();
  for (const date of ["2026-09-10", "2026-09-15", "2026-09-30", "2026-10-01", "2026-10-20", "2026-11-05", "2026-11-10", "2026-11-11"]) {
    addRecord(data, date);
  }

  const records = selectReportRecords(data, { ...baseFilter, dateFrom: "2026-09-15", dateTo: "2026-11-10" });
  const dates = records.map((record) => record.date);

  assert.deepEqual(dates, ["2026-11-10", "2026-11-05", "2026-10-20", "2026-10-01", "2026-09-30", "2026-09-15"]);
  assert.equal(new Set(dates).size, dates.length);
});

test("regression: an explicit report range is independent from the month the app is viewing", () => {
  const data = employeeData();
  addRecord(data, "2026-09-20");
  addRecord(data, "2026-10-20");
  const filter: ReportFilter = { ...baseFilter, dateFrom: "2026-09-01", dateTo: "2026-09-30" };

  // The legacy pipeline scoped records to the visible month first, so an October view dropped September.
  const legacyVisibleOctober = Object.values(data.records)
    .filter((record) => record.date.startsWith("2026-10"))
    .filter((record) => recordMatchesReportFilter(record, filter, data.settings));
  assert.equal(legacyVisibleOctober.length, 0);

  // The canonical selector ignores the visible month entirely.
  assert.deepEqual(selectReportRecords(data, filter).map((record) => record.date), ["2026-09-20"]);
});

test("a single-day range keeps only that day's matching records", () => {
  const data = employeeData();
  addRecord(data, "2026-10-03");
  addRecord(data, "2026-10-04");
  addRecord(data, "2026-10-05");

  const records = selectReportRecords(data, { ...baseFilter, dateFrom: "2026-10-04", dateTo: "2026-10-04" });

  assert.deepEqual(records.map((record) => record.date), ["2026-10-04"]);
});

test("report summary derives its metrics from the same filtered range dataset", () => {
  const data = employeeData();
  addRecord(data, "2026-09-15", { start: "08:00", end: "16:00" });
  addRecord(data, "2026-10-15", { start: "08:00", end: "17:00" });

  const records = selectReportRecords(data, { ...baseFilter, dateFrom: "2026-09-01", dateTo: "2026-09-30" });
  const summary = createReportSummary({
    data,
    monthRecords: records,
    entries: [],
    reportBillable: 0,
  });

  assert.equal(summary.isEmployee, true);
  assert.equal(summary.effectiveMonthStats.worked, 480);
  assert.equal(summary.effectiveMonthStats.target, 480);
});

test("leave ranges contribute records inside the requested report range", () => {
  const data = employeeData();
  data.leaves.push({
    id: "leave-1",
    startDate: "2026-09-21",
    endDate: "2026-09-22",
    type: "full",
    minutes: 0,
    note: "",
    createdAt: "2026-09-01T00:00:00.000Z",
  });

  const inRange = selectReportRecords(data, { ...baseFilter, dateFrom: "2026-09-01", dateTo: "2026-09-30" });
  assert.deepEqual(inRange.map((record) => record.date), ["2026-09-22", "2026-09-21"]);
  assert.ok(inRange.every((record) => record.leaveType === "full"));

  const outOfRange = selectReportRecords(data, { ...baseFilter, dateFrom: "2026-10-01", dateTo: "2026-10-31" });
  assert.deepEqual(outOfRange, []);
});

test("holiday status includes a configured holiday with no stored record or leave", () => {
  const data = employeeData();
  addHoliday(data, "2026-10-05");

  const records = selectReportRecords(data, { ...baseFilter, dateFrom: "2026-10-01", dateTo: "2026-10-10", status: "holiday" });

  assert.deepEqual(records.map((record) => record.date), ["2026-10-05"]);
  assert.equal(records.length, 1);
  assert.equal(records[0].holiday, true);
});

test("holiday status returns only holidays inside the explicit range", () => {
  const data = employeeData();
  addHoliday(data, "2026-10-05");
  addHoliday(data, "2026-11-05");

  const records = selectReportRecords(data, { ...baseFilter, dateFrom: "2026-10-01", dateTo: "2026-10-10", status: "holiday" });

  assert.deepEqual(records.map((record) => record.date), ["2026-10-05"]);
});

test("holiday status does not duplicate a holiday that already has a stored record", () => {
  const data = employeeData();
  addHoliday(data, "2026-10-05");
  addRecord(data, "2026-10-05", { start: "08:00", end: "16:00" });

  const records = selectReportRecords(data, { ...baseFilter, dateFrom: "2026-10-01", dateTo: "2026-10-10", status: "holiday" });

  assert.deepEqual(records.map((record) => record.date), ["2026-10-05"]);
  assert.equal(records.length, 1);
});

test("holiday status keeps a single entry when a holiday also has leave", () => {
  const data = employeeData();
  addHoliday(data, "2026-10-05");
  data.leaves.push({
    id: "leave-1",
    startDate: "2026-10-05",
    endDate: "2026-10-05",
    type: "full",
    minutes: 0,
    note: "",
    createdAt: "2026-10-01T00:00:00.000Z",
  });

  const records = selectReportRecords(data, { ...baseFilter, dateFrom: "2026-10-01", dateTo: "2026-10-10", status: "holiday" });

  assert.deepEqual(records.map((record) => record.date), ["2026-10-05"]);
  assert.equal(records.length, 1);
  assert.equal(records[0].leaveMinutes, 0);
});

test("the holiday domain rule keeps precedence over leave on the same date", () => {
  const data = employeeData();
  addHoliday(data, "2026-10-05");
  data.leaves.push({
    id: "leave-1",
    startDate: "2026-10-05",
    endDate: "2026-10-05",
    type: "full",
    minutes: 0,
    note: "",
    createdAt: "2026-10-01T00:00:00.000Z",
  });

  const asHoliday = selectReportRecords(data, { ...baseFilter, dateFrom: "2026-10-01", dateTo: "2026-10-10", status: "holiday" });
  assert.deepEqual(asHoliday.map((record) => record.date), ["2026-10-05"]);

  const asLeave = selectReportRecords(data, { ...baseFilter, dateFrom: "2026-10-01", dateTo: "2026-10-10", status: "leave" });
  assert.deepEqual(asLeave, []);
});

test("a one-sided range clamps the holiday scan to the known data span", () => {
  const data = employeeData();
  addRecord(data, "2026-10-10");
  addHoliday(data, "2026-10-05");
  addHoliday(data, "2026-12-31");

  const records = selectReportRecords(data, { ...baseFilter, dateFrom: "2026-10-01", status: "holiday" });

  assert.deepEqual(records.map((record) => record.date), ["2026-10-05"]);
});

test("holidays are not synthetically generated without an explicit report boundary", () => {
  const data = employeeData();
  addRecord(data, "2026-10-10");
  addHoliday(data, "2026-10-05");

  const records = selectReportRecords(data, { ...baseFilter, status: "holiday" });

  assert.deepEqual(records, []);
});

test("holiday-only scanning covers the complete explicit range beyond 370 days", () => {
  const data = employeeData();
  addHoliday(data, "2026-01-20");
  addHoliday(data, "2026-02-16");

  const records = selectReportRecords(data, {
    ...baseFilter,
    dateFrom: "2025-01-01",
    dateTo: "2026-02-15",
    status: "holiday",
  });

  assert.deepEqual(records.map((record) => record.date), ["2026-01-20", "2025-05-01"]);
  assert.equal(records.filter((record) => record.date === "2026-01-20").length, 1);
  assert.ok(records.every((record) => record.date <= "2026-02-15"));
});

test("hourly leave dates keep matching the leave status filter", () => {
  const data = employeeData();
  data.leaves.push({
    id: "leave-hourly",
    startDate: "2026-09-23",
    endDate: "2026-09-23",
    type: "hourly",
    minutes: 120,
    note: "",
    createdAt: "2026-09-01T00:00:00.000Z",
  });

  const records = selectReportRecords(data, { ...baseFilter, dateFrom: "2026-09-01", dateTo: "2026-09-30", status: "leave" });

  assert.deepEqual(records.map((record) => record.date), ["2026-09-23"]);
  assert.equal(records[0].leaveMinutes, 120);
});
