import assert from "node:assert/strict";
import test from "node:test";
import { createInitialData, defaultSettings } from "../lib/constants.ts";
import { createPayrollPreview } from "../lib/payroll-preview.ts";
import { createReportSummary } from "../lib/report-summary.ts";
import { makeWorkRecord } from "./fixtures/work-record.ts";

function employeeData() {
  const data = createInitialData({ onboarded: true });
  data.settings = structuredClone(defaultSettings);
  data.settings.mode = "employee";
  for (const day of Object.values(data.settings.weeklySchedule)) {
    day.enabled = true;
    day.targetMinutes = 480;
  }
  return data;
}

test("report summary behavior is independent from the React hook implementation", () => {
  const data = employeeData();
  const records = [
    makeWorkRecord({ date: "2026-08-10", start: "08:00", end: "17:00" }),
    makeWorkRecord({ date: "2026-08-11", start: "08:00", end: "15:00" }),
  ];
  const summary = createReportSummary({
    data,
    monthRecords: records,
    monthStats: { worked: 1, target: 1, balance: 1, breaks: 1 },
    entries: [],
    reportBillable: 0,
  });

  assert.equal(summary.isEmployee, true);
  assert.equal(summary.overtimeMinutes, 0);
  assert.equal(summary.deficitMinutes, 0);
  assert.notDeepEqual(summary.effectiveMonthStats, { worked: 1, target: 1, balance: 1, breaks: 1 });
});

test("payroll preview and report summary share observable compensation outcomes", () => {
  const data = employeeData();
  data.records["2026-08-10"] = makeWorkRecord({ date: "2026-08-10", start: "08:00", end: "15:00" });
  const records = Object.values(data.records);
  const summary = createReportSummary({
    data,
    monthRecords: records,
    monthStats: { worked: 0, target: 0, balance: 0, breaks: 0 },
    entries: [],
    reportBillable: 0,
  });
  const preview = createPayrollPreview(data, new Date("2026-08-20T12:00:00Z"));

  assert.equal(summary.deficitMinutes, 60);
  assert.equal(preview.facts.deficitMinutes, 60);
  assert.equal(preview.payroll.deficitDeduction, summary.payroll.deficitDeduction);
});
