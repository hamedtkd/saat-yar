import type { AppData } from "../types.ts";

export type AppDataCollectionKey = Exclude<keyof AppData, "settings">;
export type AppDataKey = keyof AppData;

type AppDataCollectionFactories = {
  [Key in AppDataCollectionKey]: () => AppData[Key];
};

export const APP_DATA_COLLECTION_FACTORIES = {
  records: () => ({}),
  leaves: () => [],
  clients: () => [],
  workProjects: () => [],
  projects: () => [],
  timeEntries: () => [],
  expenses: () => [],
  invoices: () => [],
  holidayOverrides: () => [],
  deletedRecords: () => [],
} satisfies AppDataCollectionFactories;

export const APP_DATA_COLLECTION_KEYS = Object.freeze(
  Object.keys(APP_DATA_COLLECTION_FACTORIES) as AppDataCollectionKey[],
);

export const APP_DATA_KEYS = Object.freeze([
  "settings",
  ...APP_DATA_COLLECTION_KEYS,
] as AppDataKey[]);

export function createEmptyAppDataCollections(): Omit<AppData, "settings"> {
  return Object.fromEntries(
    APP_DATA_COLLECTION_KEYS.map((key) => [key, APP_DATA_COLLECTION_FACTORIES[key]()]),
  ) as Omit<AppData, "settings">;
}


export function pickAppData(value: AppData): AppData {
  return Object.fromEntries(
    APP_DATA_KEYS.map((key) => [key, value[key]]),
  ) as AppData;
}

export function getMissingAppDataKeys(value: unknown): AppDataKey[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [...APP_DATA_KEYS];
  return APP_DATA_KEYS.filter((key) => !Object.prototype.hasOwnProperty.call(value, key));
}

export function assertCompleteAppData(value: unknown, label = "AppData"): asserts value is AppData {
  const missing = getMissingAppDataKeys(value);
  if (missing.length > 0) {
    throw new Error(`${label} is missing required keys: ${missing.join(", ")}`);
  }

  const candidate = value as AppData;
  if (!candidate.settings || typeof candidate.settings !== "object" || Array.isArray(candidate.settings)) {
    throw new Error(`${label}.settings must be an object`);
  }
  if (!candidate.records || typeof candidate.records !== "object" || Array.isArray(candidate.records)) {
    throw new Error(`${label}.records must be an object`);
  }

  for (const key of APP_DATA_COLLECTION_KEYS) {
    if (key === "records") continue;
    if (!Array.isArray(candidate[key])) throw new Error(`${label}.${key} must be an array`);
  }
}
