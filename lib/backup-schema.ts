import { z } from "zod";
import { migrateAppData } from "./data/migrations.ts";
import { APP_DATA_SCHEMA_VERSION } from "./data/version.ts";
import type { AppData } from "./types.ts";

const modeSchema = z.enum(["employee", "freelancer", "hybrid"]);
const isoDateSchema = z.string().min(1);
const timeSchema = z.string().regex(/^$|^\d{2}:\d{2}$/);

const payrollComponentSchema = z.object({
  id: z.string(),
  title: z.string(),
  amount: z.number().nonnegative(),
  type: z.enum(["earning", "deduction"]),
  enabled: z.boolean().optional(),
}).passthrough();

const settingsSchema = z.object({
  name: z.string(),
  onboarded: z.boolean(),
  weeklyMinutes: z.number().nonnegative(),
  workDays: z.number().int().min(1).max(7),
  defaultStart: timeSchema,
  defaultEnd: timeSchema,
  lunchMinutes: z.number().nonnegative(),
  leaveBalanceMinutes: z.number().nonnegative(),
  monthlyLeaveMinutes: z.number().nonnegative(),
  salary: z.number().nonnegative(),
  overtimeMultiplier: z.number().nonnegative(),
  holidayMultiplier: z.number().nonnegative(),
  payrollComponents: z.array(payrollComponentSchema),
  autoOfficialHolidays: z.boolean(),
  autoWeeklyHoliday: z.boolean(),
  appearance: z.object({
    mode: z.enum(["light", "dark", "system"]),
    preset: z.enum(["spotify", "emerald", "ocean", "violet", "sunset", "custom"]),
    accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    radius: z.enum(["compact", "balanced", "rounded"]),
    surface: z.enum(["neutral", "tinted", "contrast"]),
  }).passthrough(),
  notificationSettings: z.object({
    enabled: z.boolean(),
    openTimerReminderMinutes: z.number().int().nonnegative(),
    dailyTargetReminder: z.boolean(),
    endOfDayReminder: z.boolean(),
  }).passthrough(),
  mode: modeSchema,
}).passthrough();

const breakSchema = z.object({
  id: z.string(),
  start: timeSchema,
  end: timeSchema,
  title: z.string(),
  paid: z.boolean(),
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
}).passthrough();

const workRecordSchema = z.object({
  date: isoDateSchema,
  start: timeSchema,
  end: timeSchema,
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
  lunchMinutes: z.number().nonnegative(),
  lunchStart: timeSchema.optional(),
  lunchEnd: timeSchema.optional(),
  lunchStartedAt: z.string().optional(),
  lunchEndedAt: z.string().optional(),
  lunchPaid: z.boolean(),
  breaks: z.array(breakSchema),
  leaveMinutes: z.number().nonnegative(),
  leaveType: z.enum(["none", "hourly", "full"]),
  note: z.string(),
  holiday: z.boolean(),
}).passthrough();

const leaveSchema = z.object({
  id: z.string(),
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  type: z.enum(["full", "half", "hourly"]),
  minutes: z.number().nonnegative(),
  note: z.string(),
  createdAt: z.string(),
}).passthrough();

const clientSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  email: z.string().optional(),
  note: z.string().optional(),
  archived: z.boolean(),
}).passthrough();

const projectSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  name: z.string(),
  rate: z.number().nonnegative(),
  color: z.string(),
  status: z.enum(["active", "paused", "completed", "archived"]),
  budgetHours: z.number().nonnegative().optional(),
  note: z.string().optional(),
  billable: z.boolean(),
}).passthrough();

const expenseSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  clientId: z.string(),
  title: z.string(),
  amount: z.number().nonnegative(),
  date: isoDateSchema,
  category: z.enum(["software", "contractor", "travel", "equipment", "other"]),
  note: z.string().optional(),
  createdAt: z.string(),
}).passthrough();


const invoiceLineSchema = z.object({
  id: z.string(),
  description: z.string(),
  quantity: z.number().nonnegative(),
  unitPrice: z.number().nonnegative(),
}).passthrough();

const invoiceSchema = z.object({
  id: z.string(),
  number: z.string(),
  clientId: z.string(),
  projectId: z.string().optional(),
  issuedAt: isoDateSchema,
  dueAt: isoDateSchema.optional(),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
  lines: z.array(invoiceLineSchema),
  discount: z.number().nonnegative(),
  taxPercent: z.number().nonnegative(),
  note: z.string(),
  createdAt: z.string(),
  paidAt: z.string().optional(),
}).passthrough();

const holidayOverrideSchema = z.object({
  id: z.string(),
  date: isoDateSchema,
  title: z.string(),
  kind: z.enum(["company", "emergency", "manual"]),
  isHoliday: z.boolean(),
  multiplier: z.number().nonnegative().optional(),
}).passthrough();

const timeEntrySchema = z.object({
  id: z.string(),
  clientId: z.string(),
  projectId: z.string(),
  task: z.string().optional(),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  note: z.string(),
  billable: z.boolean(),
  effectiveRate: z.number().nonnegative(),
}).passthrough();

export const appDataSchema = z.object({
  settings: settingsSchema,
  records: z.record(z.string(), workRecordSchema),
  leaves: z.array(leaveSchema),
  clients: z.array(clientSchema),
  projects: z.array(projectSchema),
  timeEntries: z.array(timeEntrySchema),
  expenses: z.array(expenseSchema),
  invoices: z.array(invoiceSchema),
  holidayOverrides: z.array(holidayOverrideSchema),
}).passthrough();

export type BackupData = AppData & {
  appName?: string;
  schemaVersion?: number;
  exportedAt?: string;
};

function unwrapBackupCandidate(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const candidate = value as Record<string, unknown>;
  return candidate.data && typeof candidate.data === "object" ? candidate.data : value;
}

function assertHasSettings(value: unknown): void {
  const candidate = unwrapBackupCandidate(value);
  if (!candidate || typeof candidate !== "object" || !("settings" in candidate)) {
    throw new Error("Backup settings are required.");
  }
}

export function parseBackup(value: unknown): BackupData {
  assertHasSettings(value);
  const migration = migrateAppData(value);
  const data = appDataSchema.parse(migration.data);

  return {
    ...data,
    appName: "ساعت‌یار",
    schemaVersion: APP_DATA_SCHEMA_VERSION,
  } as BackupData;
}

export function isValidAppData(value: unknown): value is AppData {
  try {
    parseBackup(value);
    return true;
  } catch {
    return false;
  }
}
