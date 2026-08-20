import assert from "node:assert/strict";
import test from "node:test";
import { formatProjectRateAmount, hourlyRateToProjectUnit, projectRateToHourly } from "../lib/project-rate.ts";
import { getTodayWorkspaceCapabilities } from "../lib/workspace-capabilities.ts";

test("project rates can be entered hourly or daily while storage remains hourly", () => {
  assert.equal(projectRateToHourly(4_000_000, "day"), 500_000);
  assert.equal(hourlyRateToProjectUnit(500_000, "day"), 4_000_000);
  assert.equal(projectRateToHourly(500_000, "hour"), 500_000);
});

test("project rate display groups money without changing the numeric contract", () => {
  assert.equal(formatProjectRateAmount(4_000_000, "en"), "4,000,000");
  assert.match(formatProjectRateAmount(4_000_000, "fa-IR"), /۴[٬,]۰۰۰[٬,]۰۰۰/);
});

test("freelancer today owns one project timer while employee and hybrid retain attendance", () => {
  assert.deepEqual(getTodayWorkspaceCapabilities("freelancer"), { attendance: false, projectTimer: true, activitySegments: false });
  assert.deepEqual(getTodayWorkspaceCapabilities("employee"), { attendance: true, projectTimer: false, activitySegments: true });
  assert.deepEqual(getTodayWorkspaceCapabilities("hybrid"), { attendance: true, projectTimer: true, activitySegments: true });
});
