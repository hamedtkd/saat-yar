import type { AppData } from "../types.ts";
import { createCompleteAppData } from "../data/app-data-factory.ts";
import type { BackupImportAnalysis } from "./types.ts";

function arrayDiff<T extends { id: string }>(current: T[], incoming: T[]) {
  const ids = new Set(current.map((item) => item.id));
  const conflicts = incoming.filter((item) => ids.has(item.id)).length;
  return { additions: incoming.length - conflicts, conflicts };
}

function changedSettings(current: AppData, incoming: AppData) {
  return Object.keys(incoming.settings).filter((key) => {
    const currentValue = current.settings[key as keyof typeof current.settings];
    const incomingValue = incoming.settings[key as keyof typeof incoming.settings];
    return JSON.stringify(currentValue) !== JSON.stringify(incomingValue);
  }).length;
}

export function analyzeBackupImport(current: AppData, incoming: AppData): BackupImportAnalysis {
  const currentDates = new Set(Object.keys(current.records));
  const incomingDates = Object.keys(incoming.records);
  const recordConflicts = incomingDates.filter((date) => currentDates.has(date)).length;
  const details = {
    records: { additions: incomingDates.length - recordConflicts, conflicts: recordConflicts },
    leaves: arrayDiff(current.leaves, incoming.leaves),
    clients: arrayDiff(current.clients, incoming.clients),
    projects: arrayDiff(current.projects, incoming.projects),
    timeEntries: arrayDiff(current.timeEntries, incoming.timeEntries),
    expenses: arrayDiff(current.expenses, incoming.expenses),
    invoices: arrayDiff(current.invoices, incoming.invoices),
    holidayOverrides: arrayDiff(current.holidayOverrides, incoming.holidayOverrides),
    deletedRecords: arrayDiff(current.deletedRecords, incoming.deletedRecords),
  };
  const all = Object.values(details);
  return {
    incoming,
    settingsChanged: changedSettings(current, incoming),
    additions: all.reduce((sum, item) => sum + item.additions, 0),
    conflicts: all.reduce((sum, item) => sum + item.conflicts, 0),
    details,
  };
}

function mergeUniqueById<T extends { id: string }>(current: T[], incoming: T[]) {
  const ids = new Set(current.map((item) => item.id));
  return [...current, ...incoming.filter((item) => !ids.has(item.id))];
}

export function mergeBackupKeepingCurrent(current: AppData, incoming: AppData): AppData {
  const uniqueRecords = Object.fromEntries(Object.entries(incoming.records).filter(([date]) => !current.records[date]));
  return createCompleteAppData({
    settings: current.settings,
    records: { ...uniqueRecords, ...current.records },
    leaves: mergeUniqueById(current.leaves, incoming.leaves),
    clients: mergeUniqueById(current.clients, incoming.clients),
    projects: mergeUniqueById(current.projects, incoming.projects),
    timeEntries: mergeUniqueById(current.timeEntries, incoming.timeEntries),
    expenses: mergeUniqueById(current.expenses, incoming.expenses),
    invoices: mergeUniqueById(current.invoices, incoming.invoices),
    holidayOverrides: mergeUniqueById(current.holidayOverrides, incoming.holidayOverrides),
    deletedRecords: mergeUniqueById(current.deletedRecords, incoming.deletedRecords),
  });
}
