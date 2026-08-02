import { z } from "zod";
import type { AppData } from "./types";

const modeSchema = z.enum(["employee", "freelancer", "hybrid"]);
const isoDateSchema = z.string().min(1);
const timeSchema = z.string().regex(/^$|^\d{2}:\d{2}$/);

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
  mode: modeSchema.default("employee"),
}).passthrough();

const breakSchema = z.object({
  id: z.string(),
  start: timeSchema,
  end: timeSchema,
  title: z.string(),
  paid: z.boolean().optional(),
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
  lunchPaid: z.boolean().optional(),
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
  billable: z.boolean().optional(),
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
  appName: z.string().optional(),
  schemaVersion: z.number().int().positive().optional(),
  exportedAt: z.string().optional(),
  settings: settingsSchema,
  records: z.record(z.string(), workRecordSchema),
  leaves: z.array(leaveSchema).default([]),
  clients: z.array(clientSchema).default([]),
  projects: z.array(projectSchema).default([]),
  timeEntries: z.array(timeEntrySchema).default([]),
}).passthrough();

function unwrapBackup(value: unknown) {
  if (value && typeof value === "object" && "data" in value) {
    return (value as { data?: unknown }).data;
  }
  return value;
}

export function isValidAppData(value: unknown): value is AppData {
  return appDataSchema.safeParse(value).success;
}

export type BackupData = AppData & {
  appName?: string;
  schemaVersion?: number;
  exportedAt?: string;
};

export function parseBackup(value: unknown): BackupData {
  return appDataSchema.parse(unwrapBackup(value)) as BackupData;
}
