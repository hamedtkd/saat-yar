import type { AppData, Client, Expense, Project, WorkRecord } from "../types.ts";

export type CsvImportKind = "work-records" | "clients" | "projects" | "expenses";
export type CsvConflictStrategy = "skip" | "replace";

export type ParsedCsv = {
  headers: string[];
  rows: Record<string, string>[];
  delimiter: string;
};

export type CsvFieldDefinition = {
  key: string;
  label: string;
  required?: boolean;
  aliases: readonly string[];
};

export type CsvMapping = Record<string, string>;

export type ImportCandidate =
  | { kind: "work-records"; key: string; value: WorkRecord }
  | { kind: "clients"; key: string; value: Omit<Client, "id"> }
  | { kind: "projects"; key: string; value: Omit<Project, "id"> }
  | { kind: "expenses"; key: string; value: Omit<Expense, "id"> };

export type CsvPreviewRow = {
  rowNumber: number;
  label: string;
  status: "ready" | "conflict" | "invalid";
  issues: string[];
  candidate: ImportCandidate | null;
};

export type CsvImportPreview = {
  kind: CsvImportKind;
  rows: CsvPreviewRow[];
  readyCount: number;
  conflictCount: number;
  invalidCount: number;
};

export type BackupImportAnalysis = {
  incoming: AppData;
  settingsChanged: number;
  additions: number;
  conflicts: number;
  details: {
    records: { additions: number; conflicts: number };
    leaves: { additions: number; conflicts: number };
    clients: { additions: number; conflicts: number };
    projects: { additions: number; conflicts: number };
    timeEntries: { additions: number; conflicts: number };
    expenses: { additions: number; conflicts: number };
    invoices: { additions: number; conflicts: number };
    holidayOverrides: { additions: number; conflicts: number };
    deletedRecords: { additions: number; conflicts: number };
  };
};
