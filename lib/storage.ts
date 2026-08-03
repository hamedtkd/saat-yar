import { migrateAppData } from "./data/migrations.ts";
import { createAppDataSnapshot } from "./data/snapshot.ts";
import { APP_DATA_STORAGE_KEY } from "./data/version.ts";
import {
  createRecoverySnapshot,
  parseRecoverySnapshot,
  RECOVERY_STORAGE_KEY,
  recoverySnapshotToData,
  serialiseRecoverySnapshot,
  type RecoverySnapshot,
} from "./recovery.ts";
import type { AppData, StorageInfo } from "./types.ts";

const DB_NAME = "saatyar-db";
const STORE_NAME = "app-data";
const LEGACY_STORAGE_KEYS = ["saatyar-data", "saatyar", "worklog-data"] as const;

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

class IndexedDbKeyValueStorage {
  async load(): Promise<unknown | null> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(APP_DATA_STORAGE_KEY);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
    });
  }

  async save(value: unknown) {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(value, APP_DATA_STORAGE_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    db.close();
  }

  async clear() {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(APP_DATA_STORAGE_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    db.close();
  }
}

export type AppDataLoadResult = {
  value: AppData | null;
  migrated: boolean;
  migratedFrom?: number;
  source: "indexeddb" | "localstorage" | "empty";
};

export class AppDataStorageAdapter {
  private readonly storage = new IndexedDbKeyValueStorage();

  async load(): Promise<AppDataLoadResult> {
    const current = await this.storage.load();

    if (current) {
      const result = migrateAppData(current);
      if (result.migrated) {
        await this.save(result.data);
      }
      return {
        value: result.data,
        migrated: result.migrated,
        migratedFrom: result.migrated ? result.fromVersion : undefined,
        source: "indexeddb",
      };
    }

    for (const key of LEGACY_STORAGE_KEYS) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      try {
        const result = migrateAppData(JSON.parse(raw) as unknown);
        await this.save(result.data);
        localStorage.removeItem(key);
        return {
          value: result.data,
          migrated: true,
          migratedFrom: result.fromVersion,
          source: "localstorage",
        };
      } catch {
        // Ignore malformed legacy entries and continue searching.
      }
    }

    return { value: null, migrated: false, source: "empty" };
  }

  async save(value: AppData) {
    await this.storage.save(createAppDataSnapshot(value));
  }

  async clear() {
    await this.storage.clear();
  }


  saveRecovery(value: AppData, reason: RecoverySnapshot["reason"] = "manual"): RecoverySnapshot | null {
    try {
      const snapshot = createRecoverySnapshot(value, reason);
      localStorage.setItem(RECOVERY_STORAGE_KEY, serialiseRecoverySnapshot(snapshot));
      return snapshot;
    } catch {
      return null;
    }
  }

  loadRecovery(): RecoverySnapshot | null {
    const raw = localStorage.getItem(RECOVERY_STORAGE_KEY);
    if (!raw) return null;
    try {
      return parseRecoverySnapshot(JSON.parse(raw) as unknown);
    } catch {
      localStorage.removeItem(RECOVERY_STORAGE_KEY);
      return null;
    }
  }

  restoreRecovery(): AppData | null {
    const snapshot = this.loadRecovery();
    return snapshot ? recoverySnapshotToData(snapshot) : null;
  }

  clearRecovery() {
    localStorage.removeItem(RECOVERY_STORAGE_KEY);
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
