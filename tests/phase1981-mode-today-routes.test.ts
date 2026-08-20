import assert from "node:assert/strict";
import test from "node:test";

import { getPathTab, getTabHref, getTodayHref, getTodayRouteMode } from "../lib/navigation.ts";
import { getSyncChangeKind } from "../lib/multi-tab-sync.ts";
import { formatSyncSourcePath } from "../lib/multi-tab-sync-status.ts";

test("Phase 198.1 R10 gives every workspace its own Today route", () => {
  assert.equal(getTodayHref("employee"), "/employee/today");
  assert.equal(getTodayHref("freelancer"), "/freelancer/today");
  assert.equal(getTodayHref("hybrid"), "/hybrid/today");
  assert.equal(getTabHref("today", "freelancer"), "/freelancer/today");
  assert.equal(getTabHref("today"), "/today");
});

test("Phase 198.1 R10 recognizes mode-specific Today routes as the Today tab", () => {
  assert.equal(getPathTab("/employee/today/"), "today");
  assert.equal(getPathTab("/freelancer/today"), "today");
  assert.equal(getPathTab("/hybrid/today"), "today");
  assert.equal(getTodayRouteMode("/employee/today"), "employee");
  assert.equal(getTodayRouteMode("/today"), null);
});

test("Phase 198.1 R10 keeps multi-tab semantics stable across Today routes", () => {
  assert.equal(getSyncChangeKind("/hybrid/today"), "attendance");
  assert.equal(formatSyncSourcePath("/freelancer/today"), "امروز");
});
