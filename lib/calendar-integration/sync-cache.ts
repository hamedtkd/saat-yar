import type { ExternalCalendarEvent } from "./types.ts";

const DB_NAME = "saatyar-calendar-cache";
const STORE_NAME = "google-sync";
const DB_VERSION = 1;

export type GoogleCalendarSyncCacheEntry = {
  version: 1;
  calendarId: string;
  syncToken: string;
  events: ExternalCalendarEvent[];
  updatedAt: string;
};

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const request = operation(transaction.objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export async function readGoogleCalendarSyncCache(calendarId: string): Promise<GoogleCalendarSyncCacheEntry | null> {
  if (typeof indexedDB === "undefined") return null;
  try {
    const value = await withStore<GoogleCalendarSyncCacheEntry | undefined>("readonly", (store) => store.get(calendarId));
    return value?.version === 1 ? value : null;
  } catch {
    return null;
  }
}

export async function writeGoogleCalendarSyncCache(entry: GoogleCalendarSyncCacheEntry) {
  if (typeof indexedDB === "undefined") return;
  try {
    await withStore<IDBValidKey>("readwrite", (store) => store.put(entry, entry.calendarId));
  } catch {
    // Calendar cache is an optimization only; direct Google access remains the source of truth.
  }
}

export async function deleteGoogleCalendarSyncCache(calendarId: string) {
  if (typeof indexedDB === "undefined") return;
  try {
    await withStore<undefined>("readwrite", (store) => store.delete(calendarId));
  } catch {
    // Best-effort privacy cleanup.
  }
}

export async function clearGoogleCalendarSyncCache() {
  if (typeof indexedDB === "undefined") return;
  try {
    await withStore<undefined>("readwrite", (store) => store.clear());
  } catch {
    // Best-effort privacy cleanup.
  }
}
