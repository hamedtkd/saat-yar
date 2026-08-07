import type { DeviceTransferApplyMode, DeviceTransferConflictResolution } from "./device-transfer-types.ts";

export const DEVICE_TRANSFER_HISTORY_KEY = "saatyar:device-transfer-history:v1";
const MAX_HISTORY_ITEMS = 5;
const listeners = new Set<() => void>();

export type DeviceTransferHistoryEntry = {
  id: string;
  at: string;
  direction: "sent" | "received";
  deviceName: string;
  status: "acknowledged" | "applied";
  additions?: number;
  conflicts?: number;
  mode?: DeviceTransferApplyMode;
  conflictResolution?: DeviceTransferConflictResolution;
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function getBrowserStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function notifyHistoryListeners() {
  for (const listener of listeners) listener();
}

function isHistoryEntry(value: unknown): value is DeviceTransferHistoryEntry {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<DeviceTransferHistoryEntry>;
  return typeof item.id === "string"
    && typeof item.at === "string"
    && (item.direction === "sent" || item.direction === "received")
    && typeof item.deviceName === "string"
    && (item.status === "acknowledged" || item.status === "applied");
}

export function parseDeviceTransferHistory(value: string | null): DeviceTransferHistoryEntry[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isHistoryEntry).slice(0, MAX_HISTORY_ITEMS);
  } catch {
    return [];
  }
}

export function getDeviceTransferHistorySnapshot(storage: StorageLike | null = getBrowserStorage()): string {
  return storage?.getItem(DEVICE_TRANSFER_HISTORY_KEY) ?? "[]";
}

export function subscribeDeviceTransferHistory(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === DEVICE_TRANSFER_HISTORY_KEY) listener();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

export function readDeviceTransferHistory(storage: StorageLike | null = getBrowserStorage()): DeviceTransferHistoryEntry[] {
  return parseDeviceTransferHistory(getDeviceTransferHistorySnapshot(storage));
}

export function appendDeviceTransferHistory(
  entry: DeviceTransferHistoryEntry,
  storage: StorageLike | null = getBrowserStorage(),
): DeviceTransferHistoryEntry[] {
  const next = [entry, ...readDeviceTransferHistory(storage).filter((item) => item.id !== entry.id)].slice(0, MAX_HISTORY_ITEMS);
  storage?.setItem(DEVICE_TRANSFER_HISTORY_KEY, JSON.stringify(next));
  notifyHistoryListeners();
  return next;
}

export function clearDeviceTransferHistory(storage: StorageLike | null = getBrowserStorage()): DeviceTransferHistoryEntry[] {
  storage?.removeItem(DEVICE_TRANSFER_HISTORY_KEY);
  notifyHistoryListeners();
  return [];
}
