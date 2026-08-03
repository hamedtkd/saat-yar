import assert from "node:assert/strict";
import test from "node:test";

import { defaultSettings } from "../lib/constants.ts";
import { recordMatchesReportFilter } from "../lib/report-filters.ts";
import type { ReportFilter, WorkRecord } from "../lib/types.ts";

const baseFilter: ReportFilter = {
  clientId: "all",
  projectId: "all",
  billable: "all",
  query: "",
  dateFrom: "",
  dateTo: "",
  status: "all",
};

function record(patch: Partial<WorkRecord> = {}): WorkRecord {
  return {
    date: "2026-08-03",
    start: "07:30",
    end: "16:15",
    lunchMinutes: 45,
    breaks: [],
    leaveMinutes: 0,
    leaveType: "none",
    note: "جلسه برنامه‌ریزی",
    holiday: false,
    ...patch,
  };
}

test("filters records by date range", () => {
  assert.equal(recordMatchesReportFilter(record(), { ...baseFilter, dateFrom: "2026-08-01", dateTo: "2026-08-10" }, defaultSettings), true);
  assert.equal(recordMatchesReportFilter(record(), { ...baseFilter, dateFrom: "2026-08-04" }, defaultSettings), false);
});

test("filters incomplete records", () => {
  assert.equal(recordMatchesReportFilter(record({ end: "" }), { ...baseFilter, status: "incomplete" }, defaultSettings), true);
  assert.equal(recordMatchesReportFilter(record(), { ...baseFilter, status: "incomplete" }, defaultSettings), false);
});

test("filters leave, holiday and text", () => {
  assert.equal(recordMatchesReportFilter(record({ leaveMinutes: 120, leaveType: "hourly" }), { ...baseFilter, status: "leave" }, defaultSettings), true);
  assert.equal(recordMatchesReportFilter(record({ holiday: true }), { ...baseFilter, status: "holiday" }, defaultSettings), true);
  assert.equal(recordMatchesReportFilter(record(), { ...baseFilter, query: "برنامه" }, defaultSettings), true);
});
