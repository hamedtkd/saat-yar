import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const files = [
  "components/layout/app-header.tsx",
  "components/layout/navigation/sidebar-nav.tsx",
  "components/layout/navigation/mobile-bottom-nav.tsx",
  "components/layout/app-header/header-actions.tsx",
];

test("app shell modules stay below 250 lines", () => {
  for (const file of files) assert.ok(readFileSync(file, "utf8").split("\n").length <= 250, file);
});

test("shell delegates desktop and mobile navigation", () => {
  const source = readFileSync("components/saatyar-shell.tsx", "utf8");
  assert.match(source, /<SidebarNav/);
  assert.match(source, /<MobileBottomNav/);
});
