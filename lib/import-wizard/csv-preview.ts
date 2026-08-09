import { colors } from "../constants.ts";
import type { AppData, ExpenseCategory, Project } from "../types.ts";
import { normalizeImportText, normalizeKey, parseImportBoolean, parseImportDate, parseImportNumber, parseImportTime } from "./normalize.ts";
import type { CsvImportKind, CsvImportPreview, CsvMapping, ImportCandidate, ParsedCsv } from "./types.ts";

function cell(row: Record<string, string>, mapping: CsvMapping, key: string) {
  const header = mapping[key];
  return header ? row[header] ?? "" : "";
}

function findClient(data: AppData, value: string) {
  const key = normalizeKey(value);
  return data.clients.find((client) => client.id === value || normalizeKey(client.name) === key) ?? null;
}

function findProject(data: AppData, value: string, clientId = "") {
  const key = normalizeKey(value);
  return data.projects.find((project) => (project.id === value || normalizeKey(project.name) === key) && (!clientId || project.clientId === clientId)) ?? null;
}

function projectStatus(value: string): Project["status"] {
  const key = normalizeKey(value);
  if (["paused", "pause", "متوقف", "توقف"].includes(key)) return "paused";
  if (["completed", "done", "تمام", "تکمیل", "تکمیل شده"].includes(key)) return "completed";
  if (["archived", "archive", "آرشیو", "بایگانی"].includes(key)) return "archived";
  return "active";
}

function expenseCategory(value: string): ExpenseCategory {
  const key = normalizeKey(value);
  if (["contractor", "پیمانکار", "همکار"].includes(key)) return "contractor";
  if (["travel", "سفر", "رفت و آمد"].includes(key)) return "travel";
  if (["equipment", "تجهیزات", "سخت افزار"].includes(key)) return "equipment";
  if (["software", "نرم افزار", "نرمافزار"].includes(key)) return "software";
  return "other";
}

function buildWorkRecord(row: Record<string, string>, mapping: CsvMapping): { candidate: ImportCandidate | null; issues: string[]; label: string } {
  const issues: string[] = [];
  const date = parseImportDate(cell(row, mapping, "date"));
  if (!date) issues.push("تاریخ معتبر نیست");
  const start = parseImportTime(cell(row, mapping, "start"));
  const end = parseImportTime(cell(row, mapping, "end"));
  if (start === null) issues.push("ساعت ورود معتبر نیست");
  if (end === null) issues.push("ساعت خروج معتبر نیست");
  const lunchValue = cell(row, mapping, "lunchMinutes");
  const lunch = lunchValue ? parseImportNumber(lunchValue) : 0;
  if (lunch === null || lunch < 0 || lunch > 24 * 60) issues.push("دقیقه ناهار معتبر نیست");
  const label = date ?? (normalizeImportText(cell(row, mapping, "date")) || "روز بدون تاریخ");
  if (!date || issues.length) return { candidate: null, issues, label };
  return {
    issues,
    label,
    candidate: {
      kind: "work-records",
      key: date,
      value: {
        date,
        start: start ?? "",
        end: end ?? "",
        lunchMinutes: Math.round(lunch ?? 0),
        lunchPaid: false,
        breaks: [],
        leaveMinutes: 0,
        leaveType: "none",
        note: normalizeImportText(cell(row, mapping, "note")),
        holiday: parseImportBoolean(cell(row, mapping, "holiday"), false),
        manuallyEdited: true,
        updatedAt: new Date().toISOString(),
      },
    },
  };
}

function buildClient(row: Record<string, string>, mapping: CsvMapping, index: number): { candidate: ImportCandidate | null; issues: string[]; label: string } {
  const name = normalizeImportText(cell(row, mapping, "name"));
  const issues = name ? [] : ["نام مشتری الزامی است"];
  const label = name || "مشتری بدون نام";
  if (issues.length) return { candidate: null, issues, label };
  return {
    issues,
    label,
    candidate: {
      kind: "clients",
      key: normalizeKey(name),
      value: {
        name,
        color: colors[index % colors.length],
        email: normalizeImportText(cell(row, mapping, "email")) || undefined,
        note: normalizeImportText(cell(row, mapping, "note")) || undefined,
        archived: parseImportBoolean(cell(row, mapping, "archived"), false),
      },
    },
  };
}

function buildProject(row: Record<string, string>, mapping: CsvMapping, data: AppData, index: number): { candidate: ImportCandidate | null; issues: string[]; label: string } {
  const name = normalizeImportText(cell(row, mapping, "name"));
  const clientValue = normalizeImportText(cell(row, mapping, "client"));
  const client = findClient(data, clientValue);
  const issues: string[] = [];
  if (!name) issues.push("نام پروژه الزامی است");
  if (!clientValue) issues.push("مشتری پروژه الزامی است");
  else if (!client) issues.push(`مشتری «${clientValue}» در ساعت‌یار پیدا نشد`);
  const rateValue = cell(row, mapping, "rate");
  const budgetValue = cell(row, mapping, "budgetHours");
  const rate = rateValue ? parseImportNumber(rateValue) : 0;
  const budgetHours = budgetValue ? parseImportNumber(budgetValue) : null;
  if (rate === null || rate < 0) issues.push("نرخ پروژه معتبر نیست");
  if (budgetHours !== null && budgetHours < 0) issues.push("بودجه ساعت معتبر نیست");
  const label = name || "پروژه بدون نام";
  if (!client || issues.length) return { candidate: null, issues, label };
  return {
    issues,
    label,
    candidate: {
      kind: "projects",
      key: `${client.id}:${normalizeKey(name)}`,
      value: {
        clientId: client.id,
        name,
        rate: rate ?? 0,
        color: colors[(index + 2) % colors.length],
        status: projectStatus(cell(row, mapping, "status")),
        budgetHours: budgetHours ?? undefined,
        note: normalizeImportText(cell(row, mapping, "note")) || undefined,
        billable: parseImportBoolean(cell(row, mapping, "billable"), true),
      },
    },
  };
}

function buildExpense(row: Record<string, string>, mapping: CsvMapping, data: AppData): { candidate: ImportCandidate | null; issues: string[]; label: string } {
  const title = normalizeImportText(cell(row, mapping, "title"));
  const date = parseImportDate(cell(row, mapping, "date"));
  const amount = parseImportNumber(cell(row, mapping, "amount"));
  const clientValue = normalizeImportText(cell(row, mapping, "client"));
  const projectValue = normalizeImportText(cell(row, mapping, "project"));
  const project = projectValue ? findProject(data, projectValue) : null;
  const client = clientValue ? findClient(data, clientValue) : (project ? data.clients.find((item) => item.id === project.clientId) ?? null : null);
  const issues: string[] = [];
  if (!date) issues.push("تاریخ معتبر نیست");
  if (!title) issues.push("عنوان هزینه الزامی است");
  if (amount === null || amount < 0) issues.push("مبلغ هزینه معتبر نیست");
  if (clientValue && !client) issues.push(`مشتری «${clientValue}» پیدا نشد`);
  if (!projectValue) issues.push("پروژه هزینه الزامی است");
  else if (!project) issues.push(`پروژه «${projectValue}» پیدا نشد`);
  if (project && client && project.clientId !== client.id) issues.push("پروژه به مشتری انتخاب‌شده تعلق ندارد");
  const label = title || "هزینه بدون عنوان";
  if (!date || amount === null || issues.length) return { candidate: null, issues, label };
  const clientId = client?.id ?? project?.clientId ?? "";
  const projectId = project?.id ?? "";
  return {
    issues,
    label,
    candidate: {
      kind: "expenses",
      key: `${date}:${normalizeKey(title)}:${amount}:${projectId}`,
      value: {
        projectId,
        clientId,
        title,
        amount,
        date,
        category: expenseCategory(cell(row, mapping, "category")),
        note: normalizeImportText(cell(row, mapping, "note")) || undefined,
        createdAt: new Date().toISOString(),
      },
    },
  };
}

function isConflict(data: AppData, candidate: ImportCandidate) {
  if (candidate.kind === "work-records") return Boolean(data.records[candidate.key]);
  if (candidate.kind === "clients") return data.clients.some((item) => normalizeKey(item.name) === candidate.key);
  if (candidate.kind === "projects") return data.projects.some((item) => `${item.clientId}:${normalizeKey(item.name)}` === candidate.key);
  return data.expenses.some((item) => `${item.date}:${normalizeKey(item.title)}:${item.amount}:${item.projectId}` === candidate.key);
}

export function buildCsvImportPreview(kind: CsvImportKind, parsed: ParsedCsv, mapping: CsvMapping, data: AppData): CsvImportPreview {
  const seen = new Set<string>();
  const rows = parsed.rows.map((row, index) => {
    const built = kind === "work-records" ? buildWorkRecord(row, mapping)
      : kind === "clients" ? buildClient(row, mapping, index)
      : kind === "projects" ? buildProject(row, mapping, data, index)
      : buildExpense(row, mapping, data);
    if (!built.candidate) return { rowNumber: index + 2, label: built.label, status: "invalid" as const, issues: built.issues, candidate: null };
    const duplicateInFile = seen.has(built.candidate.key);
    seen.add(built.candidate.key);
    const conflict = duplicateInFile || isConflict(data, built.candidate);
    const issues = duplicateInFile ? [...built.issues, "مورد تکراری داخل همین فایل"] : built.issues;
    return { rowNumber: index + 2, label: built.label, status: conflict ? "conflict" as const : "ready" as const, issues, candidate: built.candidate };
  });
  return {
    kind,
    rows,
    readyCount: rows.filter((row) => row.status === "ready").length,
    conflictCount: rows.filter((row) => row.status === "conflict").length,
    invalidCount: rows.filter((row) => row.status === "invalid").length,
  };
}
