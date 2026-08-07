import { APP_DATA_COLLECTION_KEYS, type AppDataCollectionKey } from "./data/app-data-contract.ts";
import type {
  DeviceTransferCollectionPreview,
  DeviceTransferConflict,
  DeviceTransferPreview,
} from "./device-transfer-types.ts";
import type { AppData } from "./types.ts";

const arrayKeys = APP_DATA_COLLECTION_KEYS.filter((key) => key !== "records") as Exclude<AppDataCollectionKey, "records">[];

function same(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function countCollection(data: AppData, key: AppDataCollectionKey): number {
  if (key === "records") return Object.keys(data.records).length;
  return data[key].length;
}

function previewRecords(local: AppData, incoming: AppData, conflicts: DeviceTransferConflict[]) {
  let additions = 0;
  let conflictCount = 0;
  for (const [date, record] of Object.entries(incoming.records)) {
    const existing = local.records[date];
    if (!existing) additions += 1;
    else if (!same(existing, record)) {
      conflictCount += 1;
      conflicts.push({ scope: "records", key: date, label: `رکورد ${date}` });
    }
  }
  return { additions, conflicts: conflictCount };
}

function previewArray(key: Exclude<AppDataCollectionKey, "records">, local: AppData, incoming: AppData, conflicts: DeviceTransferConflict[]) {
  const localItems = local[key] as Array<{ id: string }>;
  const incomingItems = incoming[key] as Array<{ id: string }>;
  const byId = new Map(localItems.map((item) => [item.id, item]));
  let additions = 0;
  let conflictCount = 0;
  for (const item of incomingItems) {
    const existing = byId.get(item.id);
    if (!existing) additions += 1;
    else if (!same(existing, item)) {
      conflictCount += 1;
      conflicts.push({ scope: key, key: item.id, label: `${key}:${item.id}` });
    }
  }
  return { additions, conflicts: conflictCount };
}

export function previewDeviceTransfer(local: AppData, incoming: AppData, mode: DeviceTransferPreview["mode"]): DeviceTransferPreview {
  const conflicts: DeviceTransferConflict[] = [];
  const settingsChanged = !same(local.settings, incoming.settings);
  if (settingsChanged) conflicts.push({ scope: "settings", key: "settings", label: "تنظیمات" });

  const collections = {} as Record<AppDataCollectionKey, DeviceTransferCollectionPreview>;
  const recordStats = previewRecords(local, incoming, conflicts);
  collections.records = {
    localCount: countCollection(local, "records"), incomingCount: countCollection(incoming, "records"), ...recordStats,
  };
  for (const key of arrayKeys) {
    const stats = previewArray(key, local, incoming, conflicts);
    collections[key] = { localCount: countCollection(local, key), incomingCount: countCollection(incoming, key), ...stats };
  }

  return { mode, settingsChanged, conflictCount: conflicts.length, conflicts, collections };
}
