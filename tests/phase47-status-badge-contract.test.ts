import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(path, "utf8");

test("status badge exposes typed semantic tones while preserving legacy success usage", async () => {
  const source = await read("components/common/status-badge.tsx");
  assert.match(source, /StatusBadgeTone = "neutral" \| "success" \| "warning" \| "danger" \| "info"/);
  assert.match(source, /tone\?: StatusBadgeTone/);
  assert.match(source, /success\?: boolean/);
  assert.match(source, /toneClasses\[resolvedTone\]/);
});

test("notification permission badge uses the shared typed tone contract", async () => {
  const source = await read("components/pages/settings/notification-settings-card.tsx");
  assert.match(source, /type StatusBadgeTone/);
  assert.match(source, /const permissionTone: StatusBadgeTone/);
  assert.match(source, /<StatusBadge tone=\{permissionTone\}>/);
});
