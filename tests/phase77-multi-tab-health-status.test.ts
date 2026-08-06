import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { formatSyncTime, shortTabId } from "../lib/multi-tab-sync-status.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFile(new URL(path, root), "utf8");

test("multi-tab health helpers keep tab identifiers compact and timestamps readable", () => {
  assert.equal(shortTabId(null), "نامشخص");
  assert.match(shortTabId("tab-1234567890abcdef"), /^123456…cdef$/);
  assert.notEqual(formatSyncTime("2026-08-06T12:00:00.000Z"), "زمان نامعتبر");
  assert.equal(formatSyncTime("bad"), "زمان نامعتبر");
});

test("persistence exposes the latest external save and pending conflict state", async () => {
  const source = await read("hooks/use-persisted-app-data.ts");
  assert.match(source, /multiTabSyncStatus/);
  assert.match(source, /sourceTabId: event\.data\.tabId/);
  assert.match(source, /savedAt: event\.data\.savedAt/);
  assert.match(source, /receivedAt/);
  assert.match(source, /pending,/);
});

test("data health center renders multi-tab support, source tab and conflict state", async () => {
  const card = await read("components/pages/settings/data-health-card.tsx");
  const panel = await read("components/pages/settings/multi-tab-health-panel.tsx");
  const route = await read("app/settings/page.tsx");
  assert.match(card, /MultiTabHealthPanel status=\{syncStatus\}/);
  assert.match(panel, /سلامت همگام‌سازی چند تب/);
  assert.match(panel, /آخرین تب فرستنده/);
  assert.match(panel, /آخرین ذخیره خارجی/);
  assert.match(panel, /status\.pending/);
  assert.match(route, /multiTabSyncStatus=\{controller\.multiTabSyncStatus\}/);
});
