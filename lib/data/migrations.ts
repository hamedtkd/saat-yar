import { defaultSettings } from "../constants.ts";
import type { AppData } from "../types.ts";
import { normaliseData } from "./normalise.ts";
import { APP_DATA_SCHEMA_VERSION } from "./version.ts";
import { createDefaultWeeklySchedule, getConfiguredWorkMinutes, weekdayOrder } from "../work-schedule.ts";
import { createLegacyPayrollPolicy } from "../payroll-policy.ts";

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

function migrateV9ToV10(value: unknown): unknown {
  if (!isObject(value)) return value;
  return { ...value, invoices: Array.isArray(value.invoices) ? value.invoices : [] };
}

function migrateV10ToV11(value: unknown): unknown {
  if (!isObject(value)) return value;
  const settings = isObject(value.settings) ? value.settings : {};
  return {
    ...value,
    settings: {
      ...settings,
      notificationSettings: {
        enabled: false,
        openTimerReminderMinutes: 240,
        dailyTargetReminder: true,
        endOfDayReminder: true,
        ...(isObject(settings.notificationSettings) ? settings.notificationSettings : {}),
      },
    },
  };
}


function migrateV11ToV12(value: unknown): unknown {
  if (!isObject(value)) return value;
  const settings = isObject(value.settings) ? value.settings : {};
  return {
    ...value,
    settings: {
      ...settings,
      appearance: {
        mode: "system",
        preset: "spotify",
        accent: "#06b6d4",
        radius: "rounded",
        ...(isObject(settings.appearance) ? settings.appearance : {}),
      },
    },
  };
}

function migrateV12ToV13(value: unknown): unknown {
  if (!isObject(value)) return value;
  const settings = isObject(value.settings) ? value.settings : {};
  const appearance = isObject(settings.appearance) ? settings.appearance : {};
  return {
    ...value,
    settings: {
      ...settings,
      appearance: {
        ...appearance,
        surface: "tinted",
      },
    },
  };
}

function migrateV13ToV14(value: unknown): unknown {
  if (!isObject(value)) return value;
  const settings = isObject(value.settings) ? value.settings : {};
  const notifications = isObject(settings.notificationSettings) ? settings.notificationSettings : {};
  return {
    ...value,
    settings: {
      ...settings,
      notificationSettings: {
        ...notifications,
        breakReminder: {
          enabled: false,
          intervalMinutes: 60,
          onlyWhenTracking: true,
          ...(isObject(notifications.breakReminder) ? notifications.breakReminder : {}),
        },
      },
    },
  };
}

function migrateV14ToV15(value: unknown): unknown {
  if (!isObject(value)) return value;
  const settings = isObject(value.settings) ? value.settings : {};
  return {
    ...value,
    settings: {
      ...settings,
      autoSaveSettings: false,
    },
  };
}

function migrateV15ToV16(value: unknown): unknown {
  if (!isObject(value)) return value;
  return {
    ...value,
    deletedRecords: Array.isArray(value.deletedRecords) ? value.deletedRecords : [],
  };
}


function migrateV16ToV17(value: unknown): unknown {
  if (!isObject(value)) return value;
  const settings = isObject(value.settings) ? value.settings : {};
  const salary = typeof settings.salary === "number" ? settings.salary : defaultSettings.salary;
  const overtimeMultiplier = typeof settings.overtimeMultiplier === "number" ? settings.overtimeMultiplier : defaultSettings.overtimeMultiplier;
  const holidayMultiplier = typeof settings.holidayMultiplier === "number" ? settings.holidayMultiplier : defaultSettings.holidayMultiplier;
  return {
    ...value,
    settings: {
      ...settings,
      payrollPolicy: createLegacyPayrollPolicy({ monthlySalary: salary, overtimeMultiplier, holidayMultiplier }),
    },
  };
}


function migrateV17ToV18(value: unknown): unknown {
  if (!isObject(value)) return value;
  const settings = isObject(value.settings) ? value.settings : {};
  const defaultStart = typeof settings.defaultStart === "string" ? settings.defaultStart : defaultSettings.defaultStart;
  const defaultEnd = typeof settings.defaultEnd === "string" ? settings.defaultEnd : defaultSettings.defaultEnd;
  const lunchMinutes = typeof settings.lunchMinutes === "number" ? settings.lunchMinutes : defaultSettings.lunchMinutes;
  const defaults = createDefaultWeeklySchedule(defaultStart, defaultEnd, lunchMinutes);
  const incomingSchedule = isObject(settings.weeklySchedule) ? settings.weeklySchedule : {};
  const weeklySchedule = Object.fromEntries(weekdayOrder.map((day) => {
    const raw = isObject(incomingSchedule[day]) ? incomingSchedule[day] : {};
    const schedule = {
      ...defaults[day],
      ...raw,
      enabled: typeof raw.enabled === "boolean" ? raw.enabled : defaults[day].enabled,
      start: typeof raw.start === "string" ? raw.start : defaults[day].start,
      end: typeof raw.end === "string" ? raw.end : defaults[day].end,
      lunchMinutes: typeof raw.lunchMinutes === "number" ? Math.max(0, raw.lunchMinutes) : defaults[day].lunchMinutes,
      lunchPaid: Boolean(raw.lunchPaid),
    };
    return [day, { ...schedule, targetMinutes: getConfiguredWorkMinutes(schedule) }];
  }));
  const records = isObject(value.records)
    ? Object.fromEntries(Object.entries(value.records).map(([date, rawRecord]) => {
        const record = isObject(rawRecord) ? rawRecord : {};
        return [date, { ...record, activitySegments: Array.isArray(record.activitySegments) ? record.activitySegments : [] }];
      }))
    : {};
  const deletedRecords = Array.isArray(value.deletedRecords)
    ? value.deletedRecords.map((rawItem) => {
        if (!isObject(rawItem)) return rawItem;
        const rawRecord = isObject(rawItem.record) ? rawItem.record : {};
        return { ...rawItem, record: { ...rawRecord, activitySegments: Array.isArray(rawRecord.activitySegments) ? rawRecord.activitySegments : [] } };
      })
    : [];
  return {
    ...value,
    settings: { ...settings, workTimingMode: "scheduled", weeklySchedule },
    records,
    deletedRecords,
  };
}

function migrateV18ToV19(value: unknown): unknown {
  if (!isObject(value)) return value;
  const settings = isObject(value.settings) ? value.settings : {};
  const notifications = isObject(settings.notificationSettings) ? settings.notificationSettings : {};
  return {
    ...value,
    settings: {
      ...settings,
      notificationSettings: {
        ...notifications,
        quietHours: { enabled: false, start: "22:00", end: "07:00" },
        customReminders: [],
        snoozeMinutes: 30,
      },
    },
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
  9: migrateV9ToV10,
  10: migrateV10ToV11,
  11: migrateV11ToV12,
  12: migrateV12ToV13,
  13: migrateV13ToV14,
  14: migrateV14ToV15,
  15: migrateV15ToV16,
  16: migrateV16ToV17,
  17: migrateV17ToV18,
  18: migrateV18ToV19,
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
