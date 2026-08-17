import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { addSyncEvent, createInitialSyncStatus, formatSyncTime, shortTabId } from "../lib/multi-tab-sync-status.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFile(new URL(path, root), "utf8");

test("multi-tab health helpers keep tab identifiers compact and timestamps readable", () => {
  assert.equal(shortTabId(null), "نامشخص");
  assert.match(shortTabId("tab-1234567890abcdef"), /^123456…cdef$/);
  assert.notEqual(formatSyncTime("2026-08-06T12:00:00.000Z"), "زمان نامعتبر");
  assert.equal(formatSyncTime("bad"), "زمان نامعتبر");
});

test("sync status records the latest external save and pending conflict state", () => {
  const status = addSyncEvent(createInitialSyncStatus(), {
    kind: "deferred",
    sourceTabId: "tab-source",
    savedAt: "2026-08-06T12:00:00.000Z",
    receivedAt: "2026-08-06T12:00:01.000Z",
    sourcePath: "/today",
    changeKind: "attendance",
  });
  assert.equal(status.sourceTabId, "tab-source");
  assert.equal(status.savedAt, "2026-08-06T12:00:00.000Z");
  assert.equal(status.receivedAt, "2026-08-06T12:00:01.000Z");
  assert.equal(status.pending, true);
});

test("data health center renders multi-tab support, source tab and conflict state", async () => {
  const card = await read("components/pages/settings/data-health-card.tsx");
  const panel = await read("components/pages/settings/multi-tab-health-panel.tsx");
  const entry = await read("components/pages/settings/settings-route-entry.tsx");
  assert.match(card, /MultiTabHealthPanel status=\{syncStatus\}/);
  assert.match(panel, /s\("Multi-tab sync health"\)/);
  assert.match(panel, /s\("Last sender tab"\)/);
  assert.match(panel, /s\("Last external save"\)/);
  assert.match(panel, /status\.pending/);
  assert.match(entry, /multiTabSyncStatus=\{controller\.multiTabSyncStatus\}/);
});
