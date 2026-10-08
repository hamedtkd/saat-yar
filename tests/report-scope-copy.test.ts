import assert from "node:assert/strict";
import test from "node:test";

import { translate } from "../lib/i18n/catalog.ts";

const reportScopeKeys = [
  "reports.employeeDescription",
  "reports.freelancerDescription",
  "reports.rangeLabel",
  "reports.summaryEyebrow",
  "reports.summaryDescription",
  "reports.chartsDescription",
  "reports.employee.monthWork",
  "reports.month.employeeSummary",
  "reports.month.freelancerSummary",
  "reports.table.monthTotal",
  "reports.print.employee.4",
  "reports.charts.employeeDailyDescription",
  "reports.charts.employeeDailyAria",
  "reports.charts.employeeMonthTitle",
  "reports.charts.employeeMonthDescription",
  "reports.charts.employeeMonthFooter",
] as const;

test("Reports copy stays range-neutral in Persian and English", () => {
  for (const locale of ["fa-IR", "en"] as const) {
    for (const key of reportScopeKeys) {
      const copy = translate(locale, key);
      assert.doesNotMatch(copy, /\bthis month\b|\bmonthly\b|\bmonth summary\b|این ماه|خلاصه ماه|کارکرد ماه|وضعیت کارکرد ماه/i, `${locale}: ${key}`);
    }
    assert.match(translate(locale, "reports.rangeLabel"), /گزارش|report/i);
  }
});

test("calendar-month wording remains available to the Month page", () => {
  assert.equal(translate("fa-IR", "common.currentMonth"), "ماه جاری");
  assert.equal(translate("en", "common.currentMonth"), "Current month");
});
