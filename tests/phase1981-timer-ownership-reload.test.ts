import assert from "node:assert/strict";
import test from "node:test";

import {
  createLiveTimerLock,
  isOwnedByAnotherTab,
  LIVE_TIMER_LOCK_KEY,
  releaseOwnedLiveTimerLock,
  type LiveTimerLockStorage,
} from "../lib/live-timer-lock.ts";

type MemoryStorage = LiveTimerLockStorage & { setItem(key: string, value: string): void };

function createMemoryStorage(): MemoryStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => { values.delete(key); },
  };
}

test("Phase 198.1 R13 releases only the current tab timer lock before a hard reload", () => {
  const storage = createMemoryStorage();
  const lock = createLiveTimerLock("tab-before-reload", new Date("2026-08-18T10:00:00.000Z"));
  storage.setItem(LIVE_TIMER_LOCK_KEY, JSON.stringify(lock));

  assert.equal(releaseOwnedLiveTimerLock(storage, "another-tab"), false);
  assert.notEqual(storage.getItem(LIVE_TIMER_LOCK_KEY), null);
  assert.equal(releaseOwnedLiveTimerLock(storage, "tab-before-reload"), true);
  assert.equal(storage.getItem(LIVE_TIMER_LOCK_KEY), null);
});

test("Phase 198.1 R13 lets the reloaded page acquire a fresh tab id without weakening competing-tab detection", () => {
  const storage = createMemoryStorage();
  const oldLock = createLiveTimerLock("tab-before-reload", new Date("2026-08-18T10:00:00.000Z"));
  storage.setItem(LIVE_TIMER_LOCK_KEY, JSON.stringify(oldLock));
  releaseOwnedLiveTimerLock(storage, "tab-before-reload");

  assert.equal(isOwnedByAnotherTab(null, "tab-after-reload"), false);
  const competingLock = createLiveTimerLock("real-other-tab", new Date("2026-08-18T10:00:05.000Z"));
  assert.equal(isOwnedByAnotherTab(competingLock, "tab-after-reload", new Date("2026-08-18T10:00:10.000Z").getTime()), true);
});
