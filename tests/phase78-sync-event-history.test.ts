import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { addSyncEvent, clearSyncHistory, createInitialSyncStatus } from "../lib/multi-tab-sync-status.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFile(new URL(path, root), "utf8");

test("sync history keeps only the five newest events", () => {
  let status = createInitialSyncStatus();
  for (let index = 0; index < 7; index += 1) {
    status = addSyncEvent(status, {
      kind: index % 2 ? "deferred" : "loaded",
      sourceTabId: `tab-${index}`,
      savedAt: `2026-08-06T12:00:0${index}.000Z`,
      receivedAt: `2026-08-06T12:00:1${index}.000Z`,
      sourcePath: "/today",
    changeKind: "attendance",
    });
  }
  assert.equal(status.events.length, 5);
  assert.equal(status.events[0]?.sourceTabId, "tab-6");
  assert.equal(status.events[4]?.sourceTabId, "tab-2");
});

test("clearing sync history preserves browser support and current tab", () => {
  const status = addSyncEvent({ ...createInitialSyncStatus(), supported: true, currentTabId: "tab-current" }, {
    kind: "deferred", sourceTabId: "tab-other",
    savedAt: "2026-08-06T12:00:00.000Z", receivedAt: "2026-08-06T12:00:01.000Z",
    sourcePath: "/today",
    changeKind: "attendance",
  });
  const cleared = clearSyncHistory(status);
  assert.equal(cleared.supported, true);
  assert.equal(cleared.currentTabId, "tab-current");
  assert.equal(cleared.pending, false);
  assert.deepEqual(cleared.events, []);
});

test("settings health panel exposes recent events and a clear action", async () => {
  const panel = await read("components/pages/settings/multi-tab-health-panel.tsx");
  const route = await read("app/settings/page.tsx");
  assert.match(panel, /s\("Recent events"\)/);
  assert.match(panel, /s\("Clear sync history"\)/);
  assert.match(panel, /event\.kind === "deferred"/);
  assert.match(route, /clearMultiTabSyncHistory=\{controller\.clearMultiTabSyncHistory\}/);
});
