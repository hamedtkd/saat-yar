import type { AppData } from "../types.ts";
import { createCompleteAppData } from "./app-data-factory.ts";

function mergeById<T extends { id: string }>(current: T[], incoming: T[]) {
  const existingIds = new Set(current.map((item) => item.id));
  return [...current, ...incoming.filter((item) => !existingIds.has(item.id))];
}

export function mergeAppData(current: AppData, incoming: AppData): AppData {
  return createCompleteAppData({
    settings: { ...current.settings, ...incoming.settings },
    records: { ...current.records, ...incoming.records },
    leaves: mergeById(current.leaves, incoming.leaves),
    clients: mergeById(current.clients, incoming.clients),
    workProjects: mergeById(current.workProjects, incoming.workProjects),
    projects: mergeById(current.projects, incoming.projects),
    timeEntries: mergeById(current.timeEntries, incoming.timeEntries),
    expenses: mergeById(current.expenses, incoming.expenses),
    invoices: mergeById(current.invoices, incoming.invoices),
    holidayOverrides: mergeById(current.holidayOverrides, incoming.holidayOverrides),
    deletedRecords: mergeById(current.deletedRecords, incoming.deletedRecords),
  });
}
