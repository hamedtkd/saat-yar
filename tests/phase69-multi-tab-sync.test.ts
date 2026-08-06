import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createDataSavedMessage, isAppSyncMessage } from "../lib/multi-tab-sync.ts";

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("multi-tab messages are versioned by type and validate timestamps", () => {
  const message = createDataSavedMessage("tab-a", new Date("2026-08-06T10:00:00.000Z"));
  assert.deepEqual(message, { type: "data-saved", tabId: "tab-a", savedAt: "2026-08-06T10:00:00.000Z" });
  assert.equal(isAppSyncMessage(message), true);
  assert.equal(isAppSyncMessage({ ...message, savedAt: "invalid" }), false);
});

test("persisted data broadcasts successful saves and defers unsafe reloads", async () => {
  const source = await read("hooks/use-persisted-app-data.ts");
  assert.match(source, /new BroadcastChannel\(APP_SYNC_CHANNEL\)/);
  assert.match(source, /postMessage\(createDataSavedMessage/);
  assert.match(source, /hasUnsavedSettingsDrafts\(\)/);
  assert.match(source, /setExternalSyncPending\(true\)/);
  assert.match(source, /skipNextPersistRef\.current = true/);
});

test("shell exposes an actionable semantic multi-tab conflict banner", async () => {
  const shell = await read("components/saatyar-shell.tsx");
  const banner = await read("components/layout/multi-tab-sync-banner.tsx");
  assert.match(shell, /<MultiTabSyncBanner/);
  assert.match(banner, /اطلاعات در تب دیگری تغییر کرده است/);
  assert.match(banner, /بارگذاری نسخه جدید/);
  assert.match(banner, /var\(--warning-soft\)/);
});
