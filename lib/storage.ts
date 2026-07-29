import type { StorageInfo } from "./types";

const DB_NAME = "saatyar-db";
const STORE_NAME = "app-data";
const KEY = "current";

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class IndexedDbStorageAdapter<T> {
  async load(): Promise<T | null> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(KEY);
      request.onsuccess = () => resolve((request.result as T | undefined) ?? null);
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
    });
  }

  async save(value: T) {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(value, KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
  }

  async clear() {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
  }

  async estimate(): Promise<StorageInfo> {
    const estimate = await navigator.storage?.estimate?.();
    const persisted = await navigator.storage?.persisted?.();
    return {
      usage: estimate?.usage ?? 0,
      quota: estimate?.quota ?? 0,
      persisted: Boolean(persisted),
    };
  }

  async requestPersistence() {
    return Boolean(await navigator.storage?.persist?.());
  }
}

export async function loadWithLegacyMigration<T>(
  storage: IndexedDbStorageAdapter<T>,
  validator: (value: unknown) => value is T,
) {
  const current = await storage.load();
  if (current) return { value: current, migrated: false };

  const legacyKeys = ["saatyar-data", "saatyar", "worklog-data"];
  for (const key of legacyKeys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!validator(parsed)) continue;
      await storage.save(parsed);
      localStorage.removeItem(key);
      return { value: parsed, migrated: true };
    } catch {
      // Ignore malformed legacy data and continue searching.
    }
  }
  return { value: null, migrated: false };
}
