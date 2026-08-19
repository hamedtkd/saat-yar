import assert from "node:assert/strict";
import test from "node:test";

import { projectTimerDisplayParts, resolveRecentProjectTimerAction } from "../lib/today-timer-ux.ts";


test("Phase 198.1 R8 timer display keeps separate hour minute and second values", () => {
  assert.deepEqual(projectTimerDisplayParts(0), ["00", "00", "00"]);
  assert.deepEqual(projectTimerDisplayParts(3_723), ["01", "02", "03"]);
  assert.deepEqual(projectTimerDisplayParts(36_000 + 125), ["10", "02", "05"]);
});

test("Phase 198.1 R8 timer display clamps invalid elapsed values safely", () => {
  assert.deepEqual(projectTimerDisplayParts(-5), ["00", "00", "00"]);
  assert.deepEqual(projectTimerDisplayParts(Number.NaN), ["00", "00", "00"]);
});

test("Phase 198.1 R8 recent projects remain non-startable while another session is active", () => {
  assert.equal(resolveRecentProjectTimerAction("p1", "p1", "running"), "running");
  assert.equal(resolveRecentProjectTimerAction("p2", "p1", "running"), "blocked");
  assert.equal(resolveRecentProjectTimerAction("p2", "p1", "paused"), "blocked");
});
