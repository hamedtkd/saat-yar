import assert from "node:assert/strict";
import test from "node:test";
import { getFloatingTooltipPosition } from "../lib/floating-tooltip.ts";
import { EXPECTED_ROUTE_PATHS } from "../scripts/remote-production-audit.mjs";

test("floating tooltip stays centered above its anchor when there is enough room", () => {
  const position = getFloatingTooltipPosition(
    { left: 300, top: 220, width: 40, height: 32 },
    { width: 180, height: 70 },
    { width: 900, height: 700 },
  );
  assert.deepEqual(position, { left: 230, top: 142, side: "top" });
});

test("floating tooltip clamps to viewport edges and flips below when needed", () => {
  const position = getFloatingTooltipPosition(
    { left: 2, top: 16, width: 24, height: 24 },
    { width: 260, height: 90 },
    { width: 320, height: 240 },
  );
  assert.equal(position.left, 12);
  assert.equal(position.top, 48);
  assert.equal(position.side, "bottom");
});

test("production audit covers public trust routes without duplicate paths", () => {
  assert.equal(new Set(EXPECTED_ROUTE_PATHS).size, EXPECTED_ROUTE_PATHS.length);
  for (const path of ["/about/", "/help/", "/privacy/", "/terms/"]) {
    assert.ok(EXPECTED_ROUTE_PATHS.includes(path));
  }
  assert.equal(EXPECTED_ROUTE_PATHS.length, 13);
});
