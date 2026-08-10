import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createDataSavedMessage, isAppSyncMessage } from "../lib/multi-tab-sync.ts";
import { formatSyncSourcePath } from "../lib/multi-tab-sync-status.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFile(new URL(path, root), "utf8");

test("daily record reset requires an explicit destructive confirmation", async () => {
  const banner = await read("components/pages/today/record-health-banner.tsx");
  assert.match(banner, /setConfirmOpen\(true\)/);
  assert.match(banner, /t\("today\.health\.dialogTitle"\)/);
  assert.match(banner, /t\("today\.health\.confirm"\)/);
  assert.match(banner, /onClick=\{confirmReset\}/);
  assert.doesNotMatch(banner, /onClick=\{onReset\}/);
});

test("multi-tab save messages include their source page", () => {
  const message = createDataSavedMessage("tab-a", new Date("2026-08-06T10:00:00.000Z"), "/today");
  assert.equal(message.sourcePath, "/today");
  assert.equal(isAppSyncMessage(message), true);
  assert.equal(isAppSyncMessage({ ...message, sourcePath: "today" }), false);
});

test("sync history presents a Persian source page label", async () => {
  assert.equal(formatSyncSourcePath("/today"), "امروز");
  assert.equal(formatSyncSourcePath("/settings"), "تنظیمات");
  assert.equal(formatSyncSourcePath("/unknown"), "/unknown");
  const panel = await read("components/pages/settings/multi-tab-health-panel.tsx");
  const sync = await read("hooks/use-multi-tab-data-sync.ts");
  assert.match(panel, /pathKeys\[event\.sourcePath\] \? s\(pathKeys\[event\.sourcePath\]\) : event\.sourcePath/);
  assert.match(sync, /window\.location\.pathname/);
});
