import { z } from "zod";

const looseEntity = z.object({
  id: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  schemaVersion: z.number().int().positive().optional(),
}).loose();

const settingsSchema = z.object({
  name: z.string(),
  onboarded: z.boolean(),
  weeklyMinutes: z.number().nonnegative(),
  workDays: z.number().int().min(1).max(7),
  defaultStart: z.string(),
  defaultEnd: z.string().optional(),
  lunchMinutes: z.number().nonnegative(),
  leaveBalanceMinutes: z.number().nonnegative(),
  monthlyLeaveMinutes: z.number().nonnegative(),
  salary: z.number().nonnegative(),
  overtimeMultiplier: z.number().nonnegative(),
  holidayMultiplier: z.number().nonnegative(),
  mode: z.enum(["employee", "freelancer", "hybrid"]).optional(),
}).loose();

export const appDataSchema = z.object({
  appName: z.string().optional(),
  schemaVersion: z.number().int().positive().optional(),
  exportedAt: z.string().optional(),
  settings: settingsSchema,
  records: z.record(z.string(), looseEntity),
  leaves: z.array(looseEntity).optional().default([]),
  clients: z.array(looseEntity).optional().default([]),
  projects: z.array(looseEntity).optional().default([]),
  timeEntries: z.array(looseEntity).optional().default([]),
}).loose();

export function isValidAppData(value: unknown) {
  return appDataSchema.safeParse(value).success;
}

export function parseBackup(value: unknown) {
  return appDataSchema.parse(value);
}
