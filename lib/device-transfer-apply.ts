import { createCompleteAppData } from "./data/app-data-factory.ts";
import type { DeviceTransferApplyOptions } from "./device-transfer-types.ts";
import type { AppData } from "./types.ts";

function mergeArray<T extends { id: string }>(local: T[], incoming: T[], preferIncoming: boolean): T[] {
  const result = new Map(local.map((item) => [item.id, item]));
  for (const item of incoming) {
    if (!result.has(item.id) || preferIncoming) result.set(item.id, item);
  }
  return [...result.values()];
}

export function applyDeviceTransfer(local: AppData, incoming: AppData, options: DeviceTransferApplyOptions): AppData {
  if (options.mode === "replace") return createCompleteAppData(incoming);

  const preferIncoming = options.conflicts === "use-incoming";
  const records = { ...local.records };
  for (const [date, record] of Object.entries(incoming.records)) {
    if (!records[date] || preferIncoming) records[date] = record;
  }

  return createCompleteAppData({
    settings: preferIncoming ? incoming.settings : local.settings,
    records,
    leaves: mergeArray(local.leaves, incoming.leaves, preferIncoming),
    clients: mergeArray(local.clients, incoming.clients, preferIncoming),
    workProjects: mergeArray(local.workProjects, incoming.workProjects, preferIncoming),
    projects: mergeArray(local.projects, incoming.projects, preferIncoming),
    timeEntries: mergeArray(local.timeEntries, incoming.timeEntries, preferIncoming),
    expenses: mergeArray(local.expenses, incoming.expenses, preferIncoming),
    invoices: mergeArray(local.invoices, incoming.invoices, preferIncoming),
    holidayOverrides: mergeArray(local.holidayOverrides, incoming.holidayOverrides, preferIncoming),
    deletedRecords: mergeArray(local.deletedRecords, incoming.deletedRecords, preferIncoming),
  });
}
