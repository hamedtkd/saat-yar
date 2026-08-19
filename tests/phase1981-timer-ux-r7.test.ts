import assert from "node:assert/strict";
import test from "node:test";

import { enCatalog } from "../lib/i18n/en.ts";
import { faCatalog } from "../lib/i18n/fa.ts";
import {
  normalizedTrendPercent,
  resolveRecentProjectTimerAction,
  updateTimeEntryBoundary,
} from "../lib/today-timer-ux.ts";
import type { TimeEntry } from "../lib/types.ts";

const completedEntry: TimeEntry = {
  id: "entry-1",
  clientId: "client-1",
  projectId: "project-1",
  task: "Timer UX",
  startedAt: "2026-08-18T08:00:00.000Z",
  endedAt: "2026-08-18T09:00:00.000Z",
  note: "",
  billable: true,
  effectiveRate: 100,
};

test("Phase 198.1 R7 completed timeline entries allow a valid end-time edit", () => {
  const result = updateTimeEntryBoundary(completedEntry, "end", "2026-08-18T09:30:00.000Z");
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.entry.endedAt, "2026-08-18T09:30:00.000Z");
});

test("Phase 198.1 R7 keeps the live entry end owned by the Finish action", () => {
  const result = updateTimeEntryBoundary({ ...completedEntry, endedAt: null }, "end", "2026-08-18T09:30:00.000Z");
  assert.deepEqual(result, { ok: false, reason: "active-end" });
});

test("Phase 198.1 R7 rejects an end time before the entry start", () => {
  const result = updateTimeEntryBoundary(completedEntry, "end", "2026-08-18T07:59:00.000Z");
  assert.deepEqual(result, { ok: false, reason: "invalid-range" });
});

test("Phase 198.1 R7 recent projects never offer another Start while a timer session exists", () => {
  assert.equal(resolveRecentProjectTimerAction("project-1"), "start");
  assert.equal(resolveRecentProjectTimerAction("project-1", "project-1", "running"), "running");
  assert.equal(resolveRecentProjectTimerAction("project-1", "project-1", "paused"), "paused");
  assert.equal(resolveRecentProjectTimerAction("project-2", "project-1", "running"), "blocked");
});

test("Phase 198.1 R7 weekly trend keeps zero days visible and scales recorded days", () => {
  assert.equal(normalizedTrendPercent(0, 120), 0);
  assert.equal(normalizedTrendPercent(10, 120), 8);
  assert.equal(normalizedTrendPercent(60, 120), 50);
  assert.equal(normalizedTrendPercent(180, 120), 100);
});

test("Phase 198.1 R7 timer and trend explanations stay bilingual", () => {
  assert.equal(faCatalog["today.timer.unitHours"], "ساعت");
  assert.equal(enCatalog["today.timer.unitHours"], "hours");
  assert.match(faCatalog["today.timer.weekTrendTooltip"], /هر ستون/);
  assert.match(enCatalog["today.timer.weekTrendTooltip"], /Each bar/);
});
