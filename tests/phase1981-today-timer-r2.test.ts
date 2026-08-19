import assert from "node:assert/strict";
import test from "node:test";
import { enCatalog } from "../lib/i18n/en.ts";
import { faCatalog } from "../lib/i18n/fa.ts";
import { getFloatingTooltipPosition } from "../lib/floating-tooltip.ts";
import { getTodayWorkspaceCapabilities } from "../lib/workspace-capabilities.ts";

test("Phase 198.1 R2 localizes the project timer hero in both supported locales", () => {
  assert.equal(enCatalog["today.timer.localClock"], "Local time");
  assert.equal(enCatalog["today.timer.ready"], "Ready to start");
  assert.equal(faCatalog["today.timer.localClock"], "ساعت محلی");
  assert.equal(faCatalog["today.timer.ready"], "آماده شروع");
});

test("freelancer remains project-timer only while employee and hybrid keep attendance capabilities", () => {
  assert.deepEqual(getTodayWorkspaceCapabilities("freelancer"), {
    attendance: false,
    projectTimer: true,
    activitySegments: false,
  });
  assert.deepEqual(getTodayWorkspaceCapabilities("employee"), {
    attendance: true,
    projectTimer: false,
    activitySegments: true,
  });
  assert.deepEqual(getTodayWorkspaceCapabilities("hybrid"), {
    attendance: true,
    projectTimer: true,
    activitySegments: true,
  });
});

test("shared floating-tooltip geometry still clamps portal content inside narrow viewports", () => {
  const position = getFloatingTooltipPosition(
    { left: 2, top: 16, width: 24, height: 24 },
    { width: 260, height: 90 },
    { width: 320, height: 240 },
  );
  assert.deepEqual(position, { left: 12, top: 48, side: "bottom" });
});
