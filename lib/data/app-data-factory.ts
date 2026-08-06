import type { AppData } from "../types.ts";

type AppDataCollections = Omit<AppData, "settings">;
export type CompleteAppDataInput = Pick<AppData, "settings"> & Partial<AppDataCollections>;

export function createCompleteAppData(input: CompleteAppDataInput): AppData {
  return {
    settings: input.settings,
    records: input.records ?? {},
    leaves: input.leaves ?? [],
    clients: input.clients ?? [],
    projects: input.projects ?? [],
    timeEntries: input.timeEntries ?? [],
    expenses: input.expenses ?? [],
    invoices: input.invoices ?? [],
    holidayOverrides: input.holidayOverrides ?? [],
    deletedRecords: input.deletedRecords ?? [],
  };
}
