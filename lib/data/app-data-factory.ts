import type { AppData } from "../types.ts";
import { createEmptyAppDataCollections } from "./app-data-contract.ts";

type AppDataCollections = Omit<AppData, "settings">;
export type CompleteAppDataInput = Pick<AppData, "settings"> & Partial<AppDataCollections>;

export function createCompleteAppData(input: CompleteAppDataInput): AppData {
  return {
    ...createEmptyAppDataCollections(),
    ...input,
    settings: input.settings,
  };
}
