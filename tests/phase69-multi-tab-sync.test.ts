import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createDataSavedMessage, isAppSyncMessage } from "../lib/multi-tab-sync.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("multi-tab messages are versioned by type and validate timestamps", () => {
  const message = createDataSavedMessage("tab-a", new Date("2026-08-06T10:00:00.000Z"));
  assert.equal(message.type, "data-saved");
  assert.equal(message.tabId, "tab-a");
  assert.equal(message.savedAt, "2026-08-06T10:00:00.000Z");
  assert.equal(message.sourcePath, "/");
  assert.equal(message.changeKind, "general");
  assert.equal(isAppSyncMessage(message), true);
  assert.equal(isAppSyncMessage({ ...message, savedAt: "invalid" }), false);
});

test("persisted data broadcasts successful saves and defers unsafe reloads", async () => {
  const persisted = await read("hooks/use-persisted-app-data.ts");
  const sync = await read("hooks/use-multi-tab-data-sync.ts");
  assert.match(persisted, /useMultiTabDataSync/);
  assert.match(persisted, /publishSaved\(savedAt\)/);
  assert.match(sync, /new BroadcastChannel\(APP_SYNC_CHANNEL\)/);
  assert.match(sync, /postMessage\(createDataSavedMessage/);
  assert.match(sync, /hasUnsavedSettingsDrafts\(\)/);
  assert.match(sync, /setExternalSyncPending\(true\)/);
  assert.match(sync, /skipNextPersistRef\.current = true/);
});

test("shell exposes an actionable semantic multi-tab conflict banner", async () => {
  const shell = await read("components/saatyar-shell.tsx");
  const banner = await read("components/layout/multi-tab-sync-banner.tsx");
  assert.match(shell, /<MultiTabSyncBanner/);
  assert.match(banner, /s\("Data changed in another tab"\)/);
  assert.match(banner, /s\("Load new version"\)/);
  assert.match(banner, /var\(--warning-soft\)/);
});
