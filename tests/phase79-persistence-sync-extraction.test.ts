import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path: string) {
  return readFile(new URL(path, root), "utf8");
}

test("persisted app data stays below the repository line limit", async () => {
  const text = await source("hooks/use-persisted-app-data.ts");
  assert.ok(text.split(/\r?\n/).length <= 250);
  assert.match(text, /useMultiTabDataSync/);
  assert.doesNotMatch(text, /new BroadcastChannel/);
});

test("multi-tab coordination lives in a focused hook", async () => {
  const text = await source("hooks/use-multi-tab-data-sync.ts");
  assert.match(text, /new BroadcastChannel\(APP_SYNC_CHANNEL\)/);
  assert.match(text, /consumeSkipNextPersist/);
  assert.match(text, /publishSaved/);
  assert.match(text, /addSyncEvent/);
  assert.ok(text.split(/\r?\n/).length <= 250);
});

test("the main persistence hook delegates external sync actions", async () => {
  const text = await source("hooks/use-persisted-app-data.ts");
  assert.match(text, /reloadExternalData, dismissExternalSync, clearMultiTabSyncHistory/);
  assert.match(text, /publishSaved\(savedAt\)/);
  assert.match(text, /consumeSkipNextPersist\(\)/);
});
