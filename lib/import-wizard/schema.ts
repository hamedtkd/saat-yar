import type { CsvFieldDefinition, CsvImportKind, CsvMapping } from "./types.ts";
import { normalizeKey } from "./normalize.ts";

export const CSV_IMPORT_LABELS: Record<CsvImportKind, { title: string; description: string }> = {
  "work-records": { title: "روزهای کاری", description: "تاریخ، ورود، خروج، ناهار و یادداشت روزهای گذشته" },
  clients: { title: "مشتری‌ها", description: "نام، ایمیل و توضیحات مشتری‌ها" },
  projects: { title: "پروژه‌ها", description: "پروژه، مشتری، نرخ، بودجه و وضعیت" },
  expenses: { title: "هزینه‌ها", description: "هزینه‌های پروژه/مشتری با تاریخ و دسته‌بندی" },
};

export const CSV_IMPORT_FIELDS: Record<CsvImportKind, readonly CsvFieldDefinition[]> = {
  "work-records": [
    { key: "date", label: "تاریخ", required: true, aliases: ["date", "تاریخ", "day", "روز"] },
    { key: "start", label: "ساعت ورود", aliases: ["start", "start time", "arrival", "ورود", "ساعت ورود", "شروع"] },
    { key: "end", label: "ساعت خروج", aliases: ["end", "end time", "exit", "خروج", "ساعت خروج", "پایان"] },
    { key: "lunchMinutes", label: "ناهار (دقیقه)", aliases: ["lunch", "lunch minutes", "lunch_minutes", "ناهار", "دقیقه ناهار"] },
    { key: "note", label: "یادداشت", aliases: ["note", "notes", "description", "یادداشت", "توضیحات"] },
    { key: "holiday", label: "تعطیل", aliases: ["holiday", "is holiday", "تعطیل", "روز تعطیل"] },
  ],
  clients: [
    { key: "name", label: "نام مشتری", required: true, aliases: ["name", "client", "client name", "نام", "نام مشتری", "مشتری"] },
    { key: "email", label: "ایمیل", aliases: ["email", "e-mail", "ایمیل"] },
    { key: "note", label: "یادداشت", aliases: ["note", "notes", "description", "یادداشت", "توضیحات"] },
    { key: "archived", label: "آرشیو", aliases: ["archived", "archive", "آرشیو", "بایگانی"] },
  ],
  projects: [
    { key: "name", label: "نام پروژه", required: true, aliases: ["name", "project", "project name", "نام", "نام پروژه", "پروژه"] },
    { key: "client", label: "مشتری", required: true, aliases: ["client", "client name", "client id", "مشتری", "نام مشتری"] },
    { key: "rate", label: "نرخ", aliases: ["rate", "hourly rate", "نرخ", "نرخ ساعتی"] },
    { key: "budgetHours", label: "بودجه ساعت", aliases: ["budget", "budget hours", "budget_hours", "بودجه", "بودجه ساعت"] },
    { key: "status", label: "وضعیت", aliases: ["status", "state", "وضعیت"] },
    { key: "billable", label: "قابل صورتحساب", aliases: ["billable", "قابل صورتحساب", "صورتحساب"] },
    { key: "note", label: "یادداشت", aliases: ["note", "notes", "description", "یادداشت", "توضیحات"] },
  ],
  expenses: [
    { key: "date", label: "تاریخ", required: true, aliases: ["date", "تاریخ", "day", "روز"] },
    { key: "title", label: "عنوان", required: true, aliases: ["title", "expense", "description", "عنوان", "هزینه", "شرح"] },
    { key: "amount", label: "مبلغ", required: true, aliases: ["amount", "price", "cost", "مبلغ", "هزینه"] },
    { key: "client", label: "مشتری", aliases: ["client", "client name", "client id", "مشتری", "نام مشتری"] },
    { key: "project", label: "پروژه", required: true, aliases: ["project", "project name", "project id", "پروژه", "نام پروژه"] },
    { key: "category", label: "دسته‌بندی", aliases: ["category", "type", "دسته", "دسته بندی", "نوع"] },
    { key: "note", label: "یادداشت", aliases: ["note", "notes", "یادداشت", "توضیحات"] },
  ],
};

export function createAutoMapping(kind: CsvImportKind, headers: string[]): CsvMapping {
  const normalizedHeaders = new Map(headers.map((header) => [normalizeKey(header), header]));
  return Object.fromEntries(CSV_IMPORT_FIELDS[kind].map((field) => {
    const header = field.aliases.map(normalizeKey).map((alias) => normalizedHeaders.get(alias)).find(Boolean) ?? "";
    return [field.key, header];
  }));
}

export function getCsvTemplate(kind: CsvImportKind) {
  const headers: Record<CsvImportKind, string[]> = {
    "work-records": ["date", "start", "end", "lunch_minutes", "note", "holiday"],
    clients: ["name", "email", "note", "archived"],
    projects: ["name", "client", "rate", "budget_hours", "status", "billable", "note"],
    expenses: ["date", "title", "amount", "client", "project", "category", "note"],
  };
  const examples: Record<CsvImportKind, string[]> = {
    "work-records": ["1405/05/18", "07:30", "16:15", "45", "نمونه روز کاری", "false"],
    clients: ["مشتری نمونه", "client@example.com", "مشتری قدیمی", "false"],
    projects: ["پروژه نمونه", "مشتری نمونه", "350000", "40", "active", "true", ""],
    expenses: ["1405/05/18", "خرید دامنه", "850000", "مشتری نمونه", "پروژه نمونه", "software", ""],
  };
  return `${headers[kind].join(",")}\n${examples[kind].map((value) => `"${value.replaceAll('"', '""')}"`).join(",")}\n`;
}
