import { defaultSettings } from "../constants.ts";
import type { AppData } from "../types.ts";
import { normaliseData } from "./normalise.ts";
import { APP_DATA_SCHEMA_VERSION } from "./version.ts";
import { createDefaultWeeklySchedule } from "../work-schedule.ts";

type UnknownRecord = Record<string, unknown>;

export type VersionedDataInput = {
  schemaVersion?: number;
  data?: unknown;
};

export type MigrationResult = {
  data: AppData;
  fromVersion: number;
  toVersion: typeof APP_DATA_SCHEMA_VERSION;
  migrated: boolean;
};

function isObject(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function unwrapData(value: unknown): { payload: unknown; version: number } {
  if (!isObject(value)) {
    return { payload: value, version: 1 };
  }

  const schemaVersion =
    typeof value.schemaVersion === "number" && Number.isInteger(value.schemaVersion)
      ? value.schemaVersion
      : 1;

  if ("data" in value) {
    return { payload: value.data, version: schemaVersion };
  }

  return { payload: value, version: schemaVersion };
}

function migrateV1ToV2(value: unknown): unknown {
  if (!isObject(value)) return value;

  return {
    ...value,
    leaves: Array.isArray(value.leaves) ? value.leaves : [],
    clients: Array.isArray(value.clients) ? value.clients : [],
    projects: Array.isArray(value.projects) ? value.projects : [],
    timeEntries: Array.isArray(value.timeEntries) ? value.timeEntries : [],
  };
}

function migrateV2ToV3(value: unknown): unknown {
  if (!isObject(value)) return value;

  const settings = isObject(value.settings) ? value.settings : {};

  return {
    ...value,
    settings: {
      ...settings,
      mode: settings.mode ?? "employee",
      autoOfficialHolidays: settings.autoOfficialHolidays ?? true,
      autoWeeklyHoliday: settings.autoWeeklyHoliday ?? true,
    },
  };
}

function migrateV3ToV4(value: unknown): unknown {
  if (!isObject(value)) return value;

  const records = isObject(value.records)
    ? Object.fromEntries(
        Object.entries(value.records).map(([date, rawRecord]) => {
          const record = isObject(rawRecord) ? rawRecord : {};
          const breaks = Array.isArray(record.breaks)
            ? record.breaks.map((rawBreak) => {
                const breakItem = isObject(rawBreak) ? rawBreak : {};
                return {
                  ...breakItem,
                  paid: Boolean(breakItem.paid),
                };
              })
            : [];

          return [
            date,
            {
              ...record,
              date: typeof record.date === "string" ? record.date : date,
              breaks,
              lunchPaid: Boolean(record.lunchPaid),
              holiday: Boolean(record.holiday),
            },
          ];
        }),
      )
    : {};

  return {
    ...value,
    records,
  };
}

function migrateV4ToV5(value: unknown): unknown {
  if (!isObject(value)) return value;

  const settings = isObject(value.settings) ? value.settings : {};
  const defaultStart = typeof settings.defaultStart === "string" ? settings.defaultStart : "07:30";
  const defaultEnd = typeof settings.defaultEnd === "string" ? settings.defaultEnd : "16:15";
  const lunchMinutes = typeof settings.lunchMinutes === "number" ? settings.lunchMinutes : 45;
  const workDays = typeof settings.workDays === "number" ? Math.max(1, Math.min(7, Math.round(settings.workDays))) : 5;
  const weeklySchedule = createDefaultWeeklySchedule(defaultStart, defaultEnd, lunchMinutes);

  Object.keys(weeklySchedule).forEach((day, index) => {
    weeklySchedule[day as keyof typeof weeklySchedule].enabled = index < workDays;
  });

  return {
    ...value,
    settings: {
      ...settings,
      weeklySchedule,
    },
  };
}

function migrateV5ToV6(value: unknown): unknown {
  if (!isObject(value)) return value;
  return {
    ...value,
    holidayOverrides: Array.isArray(value.holidayOverrides) ? value.holidayOverrides : [],
  };
}

function migrateV7ToV8(value: unknown): unknown {
  if (!isObject(value)) return value;
  const settings = isObject(value.settings) ? value.settings : {};
  return { ...value, settings: { ...settings, payrollComponents: Array.isArray(settings.payrollComponents) ? settings.payrollComponents : [] } };
}

function migrateV6ToV7(value: unknown): unknown {
  if (!isObject(value)) return value;
  const records = isObject(value.records)
    ? Object.fromEntries(Object.entries(value.records).map(([date, rawRecord]) => {
        const record = isObject(rawRecord) ? rawRecord : {};
        return [date, { ...record, updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : undefined, manuallyEdited: Boolean(record.manuallyEdited) }];
      }))
    : {};
  return { ...value, records };
}

function migrateV8ToV9(value: unknown): unknown {
  if (!isObject(value)) return value;
  return {
    ...value,
    expenses: Array.isArray(value.expenses) ? value.expenses : [],
  };
}

const migrations: Record<number, (value: unknown) => unknown> = {
  1: migrateV1ToV2,
  2: migrateV2ToV3,
  3: migrateV3ToV4,
  4: migrateV4ToV5,
  5: migrateV5ToV6,
  6: migrateV6ToV7,
  7: migrateV7ToV8,
  8: migrateV8ToV9,
};

export function migrateAppData(value: unknown): MigrationResult {
  const { payload, version } = unwrapData(value);

  if (version > APP_DATA_SCHEMA_VERSION) {
    throw new Error(
      `Backup schema version ${version} is newer than supported version ${APP_DATA_SCHEMA_VERSION}.`,
    );
  }

  let current: unknown = payload;
  let currentVersion = Math.max(1, version);

  while (currentVersion < APP_DATA_SCHEMA_VERSION) {
    const migration = migrations[currentVersion];
    if (!migration) {
      throw new Error(`Missing migration from schema version ${currentVersion}.`);
    }
    current = migration(current);
    currentVersion += 1;
  }

  return {
    data: normaliseData(current as AppData, defaultSettings),
    fromVersion: version,
    toVersion: APP_DATA_SCHEMA_VERSION,
    migrated: version !== APP_DATA_SCHEMA_VERSION,
  };
}
