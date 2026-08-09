import type { AppData, Client, Expense, Project } from "../types.ts";
import { createCompleteAppData } from "../data/app-data-factory.ts";
import { normalizeKey } from "./normalize.ts";
import type { CsvConflictStrategy, CsvImportPreview, ImportCandidate } from "./types.ts";

function replaceOrAddClient(items: Client[], candidate: Extract<ImportCandidate, { kind: "clients" }>, idFactory: () => string) {
  const index = items.findIndex((item) => normalizeKey(item.name) === candidate.key);
  if (index < 0) return [...items, { id: idFactory(), ...candidate.value }];
  const next = [...items];
  next[index] = { id: items[index].id, ...candidate.value };
  return next;
}

function replaceOrAddProject(items: Project[], candidate: Extract<ImportCandidate, { kind: "projects" }>, idFactory: () => string) {
  const index = items.findIndex((item) => `${item.clientId}:${normalizeKey(item.name)}` === candidate.key);
  if (index < 0) return [...items, { id: idFactory(), ...candidate.value }];
  const next = [...items];
  next[index] = { id: items[index].id, ...candidate.value };
  return next;
}

function replaceOrAddExpense(items: Expense[], candidate: Extract<ImportCandidate, { kind: "expenses" }>, idFactory: () => string) {
  const key = (item: Expense) => `${item.date}:${normalizeKey(item.title)}:${item.amount}:${item.projectId}`;
  const index = items.findIndex((item) => key(item) === candidate.key);
  if (index < 0) return [...items, { id: idFactory(), ...candidate.value }];
  const next = [...items];
  next[index] = { id: items[index].id, ...candidate.value };
  return next;
}

export function applyCsvImport(current: AppData, preview: CsvImportPreview, strategy: CsvConflictStrategy, idFactory = () => crypto.randomUUID()) {
  let next = createCompleteAppData(current);
  let applied = 0;
  let skipped = 0;
  for (const row of preview.rows) {
    if (!row.candidate || row.status === "invalid") { skipped += 1; continue; }
    if (row.status === "conflict" && strategy === "skip") { skipped += 1; continue; }
    const candidate = row.candidate;
    if (candidate.kind === "work-records") next = { ...next, records: { ...next.records, [candidate.key]: candidate.value } };
    else if (candidate.kind === "clients") next = { ...next, clients: replaceOrAddClient(next.clients, candidate, idFactory) };
    else if (candidate.kind === "projects") next = { ...next, projects: replaceOrAddProject(next.projects, candidate, idFactory) };
    else next = { ...next, expenses: replaceOrAddExpense(next.expenses, candidate, idFactory) };
    applied += 1;
  }
  return { data: next, applied, skipped };
}
