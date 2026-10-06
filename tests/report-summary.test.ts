import assert from "node:assert/strict";
import test from "node:test";

import { entryMinutes } from "../lib/format.ts";
import { getDailyTargetMinutes } from "../lib/work-schedule.ts";
import { calc } from "../lib/time-engine.ts";
import { createInitialData } from "../lib/constants.ts";
import { timeEntryMatchesReportFilter } from "../lib/report-filters.ts";
import { selectReportRecords } from "../lib/report-records.ts";
import { createReportSummary, type ReportMonthStats, type ReportSummaryInput } from "../lib/report-summary.ts";
import type { AppData, ReportFilter, TimeEntry } from "../lib/types.ts";
import { makeWorkRecord } from "./fixtures/work-record.ts";

const allReports: ReportFilter = {
  clientId: "all",
  projectId: "all",
  billable: "all",
  query: "",
  dateFrom: "",
  dateTo: "",
  status: "all",
};

function dataFor(mode: "employee" | "freelancer" | "hybrid"): AppData {
  const data = createInitialData({ onboarded: true });
  data.settings.mode = mode;
  data.settings.autoOfficialHolidays = false;
  data.settings.autoWeeklyHoliday = false;
  for (const day of Object.values(data.settings.weeklySchedule)) {
    day.enabled = true;
    day.targetMinutes = 480;
  }
  return data;
}

function addWork(data: AppData, date: string, end: string) {
  const record = makeWorkRecord({ date, start: "08:00", end });
  data.records[date] = record;
  return record;
}

function addEntry(data: AppData, id: string, date: string, minutes: number, billable: boolean, rate = 200) {
  const startedAt = new Date(`${date}T08:00:00.000Z`);
  const endedAt = new Date(startedAt.getTime() + minutes * 60_000);
  const entry: TimeEntry = {
    id,
    clientId: "client",
    projectId: "project",
    task: "Task",
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    note: "",
    billable,
    effectiveRate: rate,
  };
  data.timeEntries.push(entry);
}

function selectedMonthStats(data: AppData, month: string): ReportMonthStats {
  return Object.values(data.records).filter((record) => record.date.startsWith(month)).reduce<ReportMonthStats>((stats, record) => {
    const target = getDailyTargetMinutes(record.date, data.settings);
    const result = calc(record, target);
    stats.worked += result.worked;
    stats.target += record.holiday ? 0 : target;
    stats.balance += result.balance;
    stats.breaks += result.breakMinutes + result.unpaidLunchMinutes;
    return stats;
  }, { worked: 0, target: 0, balance: 0, breaks: 0 });
}

// Simulates the stale selected-month stats that Reports used to receive from the Month page.
const createSummaryWithSelectedMonthStats = createReportSummary as unknown as (
  input: ReportSummaryInput & { monthStats: ReportMonthStats },
) => ReturnType<typeof createReportSummary>;

function summarize(data: AppData, filter: ReportFilter, selectedMonth: string, reportMode: "employee" | "freelancer" = data.settings.mode === "employee" ? "employee" : "freelancer") {
  const monthRecords = selectReportRecords(data, filter);
  const entries = data.timeEntries.filter((entry) => timeEntryMatchesReportFilter(entry, filter, data));
  const reportBillable = entries.filter((entry) => entry.billable).reduce((sum, entry) => sum + entryMinutes(entry), 0);
  return createSummaryWithSelectedMonthStats({
    data,
    monthRecords,
    entries,
    reportBillable,
    filters: filter,
    reportMode,
    monthStats: selectedMonthStats(data, selectedMonth),
  });
}

function freelancerTotalTime(summary: ReturnType<typeof createReportSummary>) {
  return summary.totalProjectTime;
}

test("Freelancer report total time excludes attendance records and ignores selectedDate", () => {
  for (const mode of ["freelancer", "hybrid"] as const) {
    const data = dataFor(mode);
    addWork(data, "2026-01-15", "16:00");
    addWork(data, "2026-02-15", "14:00");
    addWork(data, "2026-03-15", "12:00");
    addEntry(data, "entry-feb", "2026-02-16", 60, true);
    const filter = { ...allReports, dateFrom: "2026-01-01", dateTo: "2026-03-31" };

    const summaries = ["2026-01", "2026-02", "2026-03"].map((selectedMonth) => summarize(data, filter, selectedMonth));
    assert.deepEqual(summaries.map(freelancerTotalTime), [60, 60, 60], mode);
    assert.deepEqual(summaries.map((summary) => summary.totalProjectTime), [60, 60, 60], mode);
  }
});

test("a February report range uses only February work regardless of selectedDate", () => {
  const data = dataFor("hybrid");
  addWork(data, "2026-01-15", "16:00");
  addWork(data, "2026-02-15", "14:00");
  addWork(data, "2026-03-15", "12:00");
  const filter = { ...allReports, dateFrom: "2026-02-01", dateTo: "2026-02-28" };

  const januaryView = summarize(data, filter, "2026-01");
  const marchView = summarize(data, filter, "2026-03");
  assert.equal(januaryView.effectiveMonthStats.worked, 360);
  assert.equal(marchView.effectiveMonthStats.worked, 360);
  assert.equal(freelancerTotalTime(januaryView), freelancerTotalTime(marchView));
});

test("cross-month report work covers only the records inside the report range", () => {
  const data = dataFor("hybrid");
  addWork(data, "2026-01-19", "09:00");
  addWork(data, "2026-01-20", "10:00");
  addWork(data, "2026-02-15", "16:00");
  addWork(data, "2026-03-10", "11:00");
  addWork(data, "2026-03-11", "10:00");
  addEntry(data, "entry-in-range", "2026-02-20", 30, false);
  addEntry(data, "entry-out-of-range", "2026-03-11", 90, true);
  const filter = { ...allReports, dateFrom: "2026-01-20", dateTo: "2026-03-10" };

  const januaryView = summarize(data, filter, "2026-01");
  const marchView = summarize(data, filter, "2026-03");
  assert.equal(januaryView.effectiveMonthStats.worked, 780);
  assert.equal(freelancerTotalTime(januaryView), 30);
  assert.equal(freelancerTotalTime(marchView), 30);
  assert.equal(januaryView.totalProjectTime, 30);
});

test("an unset report date range includes all canonical records and stays selectedDate-independent", () => {
  const data = dataFor("hybrid");
  addWork(data, "2026-01-15", "10:00");
  addWork(data, "2026-02-15", "12:00");
  addWork(data, "2026-03-15", "14:00");

  const januaryView = summarize(data, allReports, "2026-01");
  const marchView = summarize(data, allReports, "2026-03");
  assert.equal(januaryView.effectiveMonthStats.worked, 720);
  assert.equal(marchView.effectiveMonthStats.worked, 720);
  assert.equal(freelancerTotalTime(januaryView), freelancerTotalTime(marchView));
});

test("Freelancer entry KPIs remain based on filtered entries and work contribution is report-scoped", () => {
  const data = dataFor("freelancer");
  addWork(data, "2026-02-10", "12:00");
  addEntry(data, "billable", "2026-02-11", 60, true, 200);
  addEntry(data, "nonbillable", "2026-02-12", 30, false, 200);
  addEntry(data, "outside", "2026-03-12", 90, true, 200);
  const summary = summarize(data, { ...allReports, dateFrom: "2026-02-01", dateTo: "2026-02-28" }, "2026-03");

  assert.equal(summary.totalProjectTime, 90);
  assert.equal(summary.nonBillableMinutes, 30);
  assert.equal(summary.effectiveMonthStats.worked, 240);
  assert.equal(summary.totalProjectTime - summary.nonBillableMinutes, 60);
});

test("Employee report summary remains based on its canonical filtered records", () => {
  const data = dataFor("employee");
  addWork(data, "2026-01-15", "16:00");
  addWork(data, "2026-02-15", "14:00");
  const summary = summarize(data, { ...allReports, dateFrom: "2026-02-01", dateTo: "2026-02-28" }, "2026-01");

  assert.equal(summary.isEmployee, true);
  assert.equal(summary.effectiveMonthStats.worked, 360);
});

test("Hybrid report contexts select Employee attendance or Freelancer project summaries explicitly", () => {
  const data = dataFor("hybrid");
  const record = addWork(data, "2026-10-04", "16:00");
  addEntry(data, "project-time", "2026-10-04", 60, true);
  const employee = summarize(data, allReports, "2026-10", "employee");
  const freelancer = summarize(data, allReports, "2026-10", "freelancer");
  assert.equal(employee.isEmployee, true);
  assert.equal(employee.effectiveMonthStats.worked, 480);
  assert.equal(freelancer.isEmployee, false);
  assert.equal(freelancer.totalProjectTime, 60);
  assert.equal(record.date, "2026-10-04");
});

test("Employee status filters do not filter Freelancer entries, and business filters do not filter attendance", () => {
  const data = dataFor("hybrid");
  addWork(data, "2026-10-04", "16:00");
  addEntry(data, "project-time", "2026-10-04", 60, true);
  const employeeFilter = { ...allReports, clientId: "missing-client", projectId: "missing-project", billable: "false" };
  assert.equal(selectReportRecords(data, employeeFilter).length, 1);
  const freelancerFilter = { ...allReports, status: "holiday" as const };
  assert.equal(timeEntryMatchesReportFilter(data.timeEntries[0], freelancerFilter, data), true);
});

test("employee payroll sums calendar months and prorates a partial fixed month by scheduled minutes", () => {
  const data = dataFor("employee");
  data.settings.payrollPolicy = {
    id: "fixed-monthly", title: "Fixed monthly", baseMode: "monthly-fixed", baseAmount: 3_100_000,
    standardDayMinutes: 480, rateBasis: "standard-month", standardMonthMinutes: 220 * 60,
    overtime: { mode: "ignore", multiplier: 0, hourlyRate: 0 },
    holiday: { mode: "ignore", multiplier: 0, hourlyRate: 0 },
    deficit: { mode: "ignore", multiplier: 0 }, rounding: { mode: "nearest", increment: 1 },
  };
  addWork(data, "2026-01-12", "16:00");
  addWork(data, "2026-02-12", "16:00");
  const fullRange = summarize(data, { ...allReports, dateFrom: "2026-01-01", dateTo: "2026-02-28" }, "2026-01");
  const partialRange = summarize(data, { ...allReports, dateFrom: "2026-01-12", dateTo: "2026-02-28" }, "2026-01");
  assert.equal(fullRange.payroll.net, 6_200_000);
  const scheduledInJanuary = Array.from({ length: 31 }, (_, index) => `2026-01-${String(index + 1).padStart(2, "0")}`)
    .filter((date) => date >= "2026-01-12")
    .reduce((sum, date) => sum + getDailyTargetMinutes(date, data.settings), 0);
  const januaryTarget = Array.from({ length: 31 }, (_, index) => `2026-01-${String(index + 1).padStart(2, "0")}`)
    .reduce((sum, date) => sum + getDailyTargetMinutes(date, data.settings), 0);
  assert.equal(partialRange.payroll.net, Math.round(3_100_000 * scheduledInJanuary / januaryTarget) + 3_100_000);
});
