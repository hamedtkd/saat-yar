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
  assert.match(sync, /persistenceSkip\.skipNext\(\)/);
  assert.match(persisted, /dataRef\.current = next;[\s\S]*syncGuard\.markLocalChange\(\)/);
  assert.match(persisted, /scheduleGuardedSave\(data, 220, \(\) => !hasUnresolvedExternalConflict\(\)/);
  assert.match(persisted, /if \(revision && currentRevision && Date\.parse\(revision\) < Date\.parse\(currentRevision\)\) return false/);
  assert.match(sync, /const startingGeneration = syncGuard\.currentGeneration\(\);[\s\S]*await storage\.load\(\)/);
  assert.match(sync, /syncGuard\.currentGeneration\(\) !== startingGeneration/);
  assert.match(sync, /syncGuard\.deferRemoteUpdate\(saveState === "saving"\)/);
  assert.match(persisted, /persistenceRevisionRef\.current = \(await storage\.load\(\)\)\.revision;[\s\S]*persistData\(latestDataRef\.current\)/);
});

test("autosave, recovery, retry, and import use serialized compare-and-save paths", async () => {
  const persisted = await read("hooks/use-persisted-app-data.ts");
  const suspend = await read("hooks/use-system-suspend-recovery.ts");
  const backup = await read("hooks/controller/use-backup-actions.ts");
  assert.match(persisted, /const persistData = useCallback\(\(value: AppData\) => enqueuePersistence\(async \(\) =>/);
  assert.match(persisted, /retrySave = useCallback\(async \(\) => \{\s*const saved = await persistData\(/);
  assert.match(persisted, /persistImmediately: persistData/);
  assert.match(suspend, /persist: persistImmediately/);
  assert.match(backup, /enqueuePersistence\(\(\) => storage\.save\(next\)\)/);
});

test("shell exposes an actionable semantic multi-tab conflict banner", async () => {
  const shell = await read("components/saatyar-shell.tsx");
  const banner = await read("components/layout/multi-tab-sync-banner.tsx");
  const notice = await read("components/common/floating-notice.tsx");
  assert.match(shell, /<MultiTabSyncBanner/);
  assert.match(banner, /s\("Data changed in another tab"\)/);
  assert.match(banner, /s\("Load new version \(discard local changes\)"\)/);
  assert.match(banner, /s\("Keep my changes \(replace newer version\)"\)/);
  assert.match(banner, /tone="warning"/);
  assert.match(notice, /var\(--warning-soft\)/);
});
