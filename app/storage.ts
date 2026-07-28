"use client";

import Dexie, { type EntityTable, type Table, type Transaction } from "dexie";

const DB_NAME = "saatyar";
const DB_VERSION = 2;
export const LEGACY_STORAGE_KEY = "saatyar-v1";
const MIGRATION_KEY = "saatyar-idb-migrated-v2";
const CURRENT_KEY = "current";
const SCHEMA_VERSION = 3;

type Entity = Record<string, unknown> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  schemaVersion?: number;
};

type WorkSessionEntity = Entity & {
  id: string;
  date: string;
  startedAt?: string;
};

type LeaveEntity = Entity & {
  id: string;
  startDate: string;
};

type ClientEntity = Entity & {
  id: string;
  archived?: boolean;
};

type ProjectEntity = Entity & {
  id: string;
  clientId: string;
  status?: string;
};

type TimeEntryEntity = Entity & {
  id: string;
  projectId: string;
  clientId: string;
  startedAt: string;
  billable?: boolean;
};

type SettingsRow = { key: string; value: unknown };
type MetaRow = { key: string; value: unknown };

type AppStateShape = {
  settings?: unknown;
  records?: Record<string, Entity>;
  leaves?: Entity[];
  clients?: Entity[];
  projects?: Entity[];
  timeEntries?: Entity[];
};

function normalizeEntity<T extends Entity>(entity: T, fallbackId?: string): T & Required<Pick<Entity, "id" | "createdAt" | "updatedAt" | "schemaVersion">> {
  const now = new Date().toISOString();
  return {
    ...entity,
    id: entity.id || fallbackId || crypto.randomUUID(),
    createdAt: entity.createdAt || now,
    updatedAt: now,
    schemaVersion: entity.schemaVersion || SCHEMA_VERSION,
  };
}

class SaatyarDatabase extends Dexie {
  settings!: EntityTable<SettingsRow, "key">;
  workSessions!: EntityTable<WorkSessionEntity, "id">;
  leaves!: EntityTable<LeaveEntity, "id">;
  clients!: EntityTable<ClientEntity, "id">;
  projects!: EntityTable<ProjectEntity, "id">;
  timeEntries!: EntityTable<TimeEntryEntity, "id">;
  meta!: EntityTable<MetaRow, "key">;

  constructor() {
    super(DB_NAME);

    // Version 1 was a single object-store value. Keeping its declaration lets
    // Dexie upgrade existing installations without losing their local data.
    this.version(1).stores({ "app-state": "" });
    this.version(DB_VERSION)
      .stores({
        "app-state": null,
        settings: "&key",
        workSessions: "&id, &date, startedAt",
        leaves: "&id, startDate, endDate",
        clients: "&id, archived",
        projects: "&id, clientId, status",
        timeEntries: "&id, projectId, clientId, startedAt, billable",
        meta: "&key",
      })
      .upgrade(async (transaction) => {
        const legacyTable = transaction.table("app-state") as Table<unknown, string>;
        const legacy = (await legacyTable.get(CURRENT_KEY)) as AppStateShape | undefined;
        if (!legacy?.settings) return;
        await writeStructuredState(transaction, legacy);
        await transaction.table("meta").put({
          key: "structured-migration",
          value: new Date().toISOString(),
        });
      });
  }
}

async function writeStructuredState(
  transaction: Transaction,
  source: AppStateShape,
) {
  const settings = transaction.table("settings");
  const sessions = transaction.table("workSessions");
  const leaves = transaction.table("leaves");
  const clients = transaction.table("clients");
  const projects = transaction.table("projects");
  const timeEntries = transaction.table("timeEntries");

  await Promise.all([
    settings.clear(),
    sessions.clear(),
    leaves.clear(),
    clients.clear(),
    projects.clear(),
    timeEntries.clear(),
  ]);

  await settings.put({ key: CURRENT_KEY, value: source.settings ?? {} });

  const workRows = Object.entries(source.records ?? {}).map(([date, value]) => {
    const normalized = normalizeEntity({ ...value, date }, `work-${date}`);
    return { ...normalized, date, startedAt: String(value.startedAt ?? "") };
  });
  const leaveRows = (source.leaves ?? []).map((value) => normalizeEntity(value));
  const clientRows = (source.clients ?? []).map((value) => normalizeEntity(value));
  const projectRows = (source.projects ?? []).map((value) => normalizeEntity(value));
  const timeRows = (source.timeEntries ?? []).map((value) => normalizeEntity(value));

  if (workRows.length) await sessions.bulkPut(workRows);
  if (leaveRows.length) await leaves.bulkPut(leaveRows);
  if (clientRows.length) await clients.bulkPut(clientRows);
  if (projectRows.length) await projects.bulkPut(projectRows);
  if (timeRows.length) await timeEntries.bulkPut(timeRows);
}

export interface StorageAdapter<T> {
  load(): Promise<T | null>;
  save(value: T): Promise<void>;
  replace(value: T): Promise<void>;
  estimate(): Promise<{ usage: number; quota: number; persisted: boolean }>;
  requestPersistence(): Promise<boolean>;
}

export class IndexedDbStorageAdapter<T extends AppStateShape> implements StorageAdapter<T> {
  private readonly db = new SaatyarDatabase();

  async load(): Promise<T | null> {
    const settings = await this.db.settings.get(CURRENT_KEY);
    if (!settings) return null;
    const [sessions, leaves, clients, projects, timeEntries] = await Promise.all([
      this.db.workSessions.toArray(),
      this.db.leaves.toArray(),
      this.db.clients.toArray(),
      this.db.projects.toArray(),
      this.db.timeEntries.toArray(),
    ]);

    return {
      settings: settings.value,
      records: Object.fromEntries(sessions.map((session) => [session.date, session])),
      leaves,
      clients,
      projects,
      timeEntries,
    } as unknown as T;
  }

  async save(value: T): Promise<void> {
    await this.replace(value);
  }

  async replace(value: T): Promise<void> {
    await this.db.transaction(
      "rw",
      [
        this.db.settings,
        this.db.workSessions,
        this.db.leaves,
        this.db.clients,
        this.db.projects,
        this.db.timeEntries,
        this.db.meta,
      ],
      async (transaction) => {
        await writeStructuredState(transaction, value);
        await transaction.table("meta").put({
          key: "last-write",
          value: new Date().toISOString(),
        });
      },
    );
  }

  async estimate() {
    const result = await navigator.storage?.estimate?.();
    const persisted = await navigator.storage?.persisted?.();
    return {
      usage: result?.usage ?? 0,
      quota: result?.quota ?? 0,
      persisted: Boolean(persisted),
    };
  }

  async requestPersistence() {
    return Boolean(await navigator.storage?.persist?.());
  }
}

export class WorkSessionRepository {
  constructor(private readonly table: Table<WorkSessionEntity, string>) {}
  byDate(date: string) { return this.table.where("date").equals(date).first(); }
  between(start: string, end: string) { return this.table.where("date").between(start, end, true, true).toArray(); }
  put(value: WorkSessionEntity) { return this.table.put(normalizeEntity(value)); }
}

export class LeaveRepository {
  constructor(private readonly table: Table<LeaveEntity, string>) {}
  all() { return this.table.orderBy("startDate").reverse().toArray(); }
  put(value: LeaveEntity) { return this.table.put(normalizeEntity(value)); }
}

export class ClientRepository {
  constructor(private readonly table: Table<ClientEntity, string>) {}
  active() { return this.table.where("archived").equals(0).toArray(); }
  put(value: ClientEntity) { return this.table.put(normalizeEntity(value)); }
}

export class ProjectRepository {
  constructor(private readonly table: Table<ProjectEntity, string>) {}
  byClient(clientId: string) { return this.table.where("clientId").equals(clientId).toArray(); }
  put(value: ProjectEntity) { return this.table.put(normalizeEntity(value)); }
}

export class TimeEntryRepository {
  constructor(private readonly table: Table<TimeEntryEntity, string>) {}
  byProject(projectId: string) { return this.table.where("projectId").equals(projectId).toArray(); }
  running() { return this.table.filter((entry) => !entry.endedAt).first(); }
  put(value: TimeEntryEntity) { return this.table.put(normalizeEntity(value)); }
}

export async function loadWithLegacyMigration<T extends AppStateShape>(
  adapter: StorageAdapter<T>,
  validate: (value: unknown) => value is T,
): Promise<{ value: T | null; migrated: boolean }> {
  const indexedValue = await adapter.load();
  if (indexedValue && validate(indexedValue)) return { value: indexedValue, migrated: false };

  const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!legacyRaw) return { value: null, migrated: false };

  try {
    const parsed: unknown = JSON.parse(legacyRaw);
    if (!validate(parsed)) return { value: null, migrated: false };
    await adapter.replace(parsed);
    localStorage.setItem(MIGRATION_KEY, new Date().toISOString());
    return { value: parsed, migrated: true };
  } catch {
    return { value: null, migrated: false };
  }
}
