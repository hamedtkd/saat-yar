import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createInitialData } from "../lib/constants.ts";
import { AppDataSyncGuard, OneShotPersistenceSkip, scheduleGuardedSave } from "../lib/app-data-sync-guard.ts";
import { AsyncTaskQueue } from "../lib/async-task-queue.ts";
import { AppDataSaveConflictError, AppDataStorageAdapter } from "../lib/storage.ts";
import type { AppData } from "../lib/types.ts";

test("a remote save during the debounce preserves local memory and prevents the stale write", async () => {
  const guard = new AppDataSyncGuard();
  let memory = "base";
  let persisted = "base";
  let writes = 0;

  memory = "local edit";
  guard.markLocalChange();
  scheduleGuardedSave(memory, 220, () => !guard.hasConflict(), (value) => {
    persisted = value;
    writes += 1;
  });

  persisted = "remote save";
  assert.equal(guard.deferRemoteUpdate(false), true);
  await new Promise((resolve) => setTimeout(resolve, 250));

  assert.equal(memory, "local edit");
  assert.equal(persisted, "remote save");
  assert.equal(writes, 0);
  assert.equal(guard.hasLocalChanges(), true);
});

test("clean tabs accept remote updates and a saved local generation becomes clean again", () => {
  const guard = new AppDataSyncGuard();
  assert.equal(guard.deferRemoteUpdate(false), false);
  guard.applyRemoteUpdate();
  assert.equal(guard.hasLocalChanges(), false);

  guard.markLocalChange();
  const generation = guard.captureSaveGeneration();
  guard.confirmSave(generation);
  assert.equal(guard.hasLocalChanges(), false);
  assert.equal(guard.deferRemoteUpdate(false), false);
});

test("remote updates during an active save and failed saves keep the dirty state", () => {
  const guard = new AppDataSyncGuard();
  guard.markLocalChange();
  const attemptedGeneration = guard.captureSaveGeneration();
  assert.equal(guard.deferRemoteUpdate(true), true);
  assert.equal(guard.hasConflict(), true);
  guard.failSave();
  assert.equal(guard.hasLocalChanges(), true);
  assert.equal(guard.captureSaveGeneration(), attemptedGeneration);
});

test("a successful save does not clear a newer local edit made while it was in flight", () => {
  const guard = new AppDataSyncGuard();
  guard.markLocalChange();
  const attemptedGeneration = guard.captureSaveGeneration();
  guard.markLocalChange();
  guard.confirmSave(attemptedGeneration);
  assert.equal(guard.hasLocalChanges(), true);
});

test("applying remote data suppresses one autosave, then later local edits can save", () => {
  const guard = new AppDataSyncGuard();
  const suppression = new OneShotPersistenceSkip();
  guard.applyRemoteUpdate();
  suppression.skipNext();
  const remoteWouldScheduleSave = !suppression.consume();

  guard.markLocalChange();
  const laterLocalEditCanSave = !suppression.consume() && !guard.hasConflict();
  assert.equal(remoteWouldScheduleSave, false);
  assert.equal(laterLocalEditCanSave, true);
});

let indexedDbRecord: unknown = null;
const originalIndexedDb = Object.getOwnPropertyDescriptor(globalThis, "indexedDB");
type FakeRequest = { result?: unknown; onsuccess?: () => void; onerror?: () => void; error?: Error };
type FakeTransaction = {
  error: Error;
  aborted: boolean;
  wrote: boolean;
  onabort?: () => void;
  oncomplete?: () => void;
  onerror?: () => void;
  abort: () => void;
  objectStore: () => { get: () => FakeRequest; put: (value: unknown) => void };
};
const fakeDb = {
  objectStoreNames: { contains: () => true },
  close() {},
  transaction() {
    const transaction: FakeTransaction = { error: new Error("transaction failed"), aborted: false, wrote: false, abort: () => {}, objectStore: () => ({ get: () => ({}), put: () => {} }) };
    transaction.abort = () => {
      transaction.aborted = true;
      queueMicrotask(() => transaction.onabort?.());
    };
    transaction.objectStore = () => ({
      get() {
        const request: FakeRequest = {};
        queueMicrotask(() => {
          request.result = indexedDbRecord;
          request.onsuccess?.();
          if (!transaction.aborted && !transaction.wrote) transaction.oncomplete?.();
        });
        return request;
      },
      put(value: unknown) {
        transaction.wrote = true;
        indexedDbRecord = structuredClone(value);
        queueMicrotask(() => transaction.oncomplete?.());
      },
    });
    return transaction;
  },
};

Object.defineProperty(globalThis, "indexedDB", {
  configurable: true,
  value: {
    open() {
      const request: FakeRequest = {};
      queueMicrotask(() => {
        request.result = fakeDb;
        request.onsuccess?.();
      });
      return request;
    },
  },
});

after(() => {
  if (originalIndexedDb) Object.defineProperty(globalThis, "indexedDB", originalIndexedDb);
  else Reflect.deleteProperty(globalThis, "indexedDB");
});

test("compare-and-save refuses an older whole-AppData snapshot after another tab commits", async () => {
  indexedDbRecord = null;
  const storage = new AppDataStorageAdapter();
  const base = createInitialData({ onboarded: true });
  const baseRevision = await storage.save(base);
  const remote: AppData = { ...base, settings: { ...base.settings, name: "remote" } };
  await storage.saveIfRevision(remote, baseRevision);
  const local: AppData = { ...base, settings: { ...base.settings, name: "local" } };

  await assert.rejects(storage.saveIfRevision(local, baseRevision), AppDataSaveConflictError);
  const loaded = await storage.load();
  assert.equal(loaded.value?.settings.name, "remote");
  assert.notEqual(loaded.revision, baseRevision);
});

test("two writers using the same revision cannot both commit", async () => {
  indexedDbRecord = null;
  const firstTabStorage = new AppDataStorageAdapter();
  const secondTabStorage = new AppDataStorageAdapter();
  const base = createInitialData({ onboarded: true });
  const baseRevision = await firstTabStorage.save(base);
  await secondTabStorage.load();
  const first: AppData = { ...base, settings: { ...base.settings, name: "first tab" } };
  const second: AppData = { ...base, settings: { ...base.settings, name: "second tab" } };

  const results = await Promise.allSettled([
    firstTabStorage.saveIfRevision(first, baseRevision),
    secondTabStorage.saveIfRevision(second, baseRevision),
  ]);

  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  const rejected = results.find((result) => result.status === "rejected");
  assert.ok(rejected && rejected.status === "rejected" && rejected.reason instanceof AppDataSaveConflictError);
  const persisted = await firstTabStorage.load();
  assert.ok(persisted.value?.settings.name === "first tab" || persisted.value?.settings.name === "second tab");
});

test("same-tab overlapping saves serialize against the revision committed by the prior save", async () => {
  indexedDbRecord = null;
  const storage = new AppDataStorageAdapter();
  const base = createInitialData({ onboarded: true });
  const baseRevision = await storage.save(base);
  const first: AppData = { ...base, settings: { ...base.settings, name: "first local snapshot" } };
  const second: AppData = { ...base, settings: { ...base.settings, name: "latest local snapshot" } };
  const queue = new AsyncTaskQueue();
  let revision = baseRevision;
  const save = (value: AppData) => queue.run(async () => {
    revision = await storage.saveIfRevision(value, revision);
  });

  const results = await Promise.allSettled([
    save(first),
    save(second),
  ]);

  assert.equal(results.filter((result) => result.status === "fulfilled").length, 2);
  const persisted = await storage.load();
  assert.equal(persisted.value?.settings.name, "latest local snapshot");
});

test("autosave, recovery, retry, and import writes stay serialized even when one fails", async () => {
  const queue = new AsyncTaskQueue();
  const order: string[] = [];
  let activeWrites = 0;
  let maximumConcurrentWrites = 0;
  const write = (name: string, fail = false) => queue.run(async () => {
    activeWrites += 1;
    maximumConcurrentWrites = Math.max(maximumConcurrentWrites, activeWrites);
    order.push(`${name}:start`);
    await new Promise((resolve) => setTimeout(resolve, 2));
    order.push(`${name}:end`);
    activeWrites -= 1;
    if (fail) throw new Error("simulated save failure");
  });
  const results = await Promise.allSettled([write("autosave"), write("recovery"), write("retry", true), write("import")]);
  assert.equal(maximumConcurrentWrites, 1);
  assert.deepEqual(results.map((result) => result.status), ["fulfilled", "fulfilled", "rejected", "fulfilled"]);
  assert.deepEqual(order, ["autosave:start", "autosave:end", "recovery:start", "recovery:end", "retry:start", "retry:end", "import:start", "import:end"]);
});

test("keep-local compare-and-save cannot overwrite a revision committed after conflict inspection", async () => {
  indexedDbRecord = null;
  const storage = new AppDataStorageAdapter();
  const base = createInitialData({ onboarded: true });
  const revision10 = await storage.save(base);
  const tabB: AppData = { ...base, settings: { ...base.settings, name: "tab B" } };
  await storage.saveIfRevision(tabB, revision10);

  const conflictSnapshot = await storage.load();
  assert.equal(conflictSnapshot.value?.settings.name, "tab B");
  const tabC: AppData = { ...base, settings: { ...base.settings, name: "tab C" } };
  await storage.saveIfRevision(tabC, conflictSnapshot.revision);

  const tabA: AppData = { ...base, settings: { ...base.settings, name: "tab A local" } };
  await assert.rejects(storage.saveIfRevision(tabA, conflictSnapshot.revision), AppDataSaveConflictError);
  const finalSnapshot = await storage.load();
  assert.equal(finalSnapshot.value?.settings.name, "tab C");
});

test("explicit keep-local resolution reloads the latest revision and replaces it with the full local snapshot", async () => {
  indexedDbRecord = null;
  const storage = new AppDataStorageAdapter();
  const base = createInitialData({ onboarded: true });
  const revision10 = await storage.save(base);
  const tabB: AppData = { ...base, settings: { ...base.settings, name: "tab B" } };
  await storage.saveIfRevision(tabB, revision10);
  const latestAtChoice = await storage.load();
  const localA: AppData = { ...base, settings: { ...base.settings, name: "tab A" } };

  await storage.saveIfRevision(localA, latestAtChoice.revision);
  const finalSnapshot = await storage.load();
  assert.equal(finalSnapshot.value?.settings.name, "tab A");
  assert.notEqual(finalSnapshot.revision, latestAtChoice.revision);
});
