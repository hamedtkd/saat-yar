import type { AppData, LeaveEntry, Settings } from "./types.ts";
import { localDateKey } from "./format.ts";
import { createDefaultWeeklySchedule } from "./work-schedule.ts";

export const defaultSettings: Settings = {
  name: "",
  onboarded: false,
  weeklyMinutes: 42 * 60 + 30,
  workDays: 5,
  weeklySchedule: createDefaultWeeklySchedule(),
  defaultStart: "07:30",
  defaultEnd: "16:15",
  lunchMinutes: 45,
  leaveBalanceMinutes: 26 * 60,
  monthlyLeaveMinutes: 16 * 60,
  salary: 30_000_000,
  overtimeMultiplier: 1.4,
  holidayMultiplier: 1.4,
  payrollComponents: [],
  autoOfficialHolidays: true,
  autoWeeklyHoliday: true,
  mode: "employee",
};

export const colors = ["#0969a9", "#f4a500", "#0a9d63", "#7d55b6", "#e76f1e", "#238d9a"];

export const initialData: AppData = {
  settings: defaultSettings,
  records: {},
  leaves: [],
  clients: [],
  projects: [],
  timeEntries: [],
  expenses: [],
  invoices: [],
  holidayOverrides: [],
};

export function createLeaveDraft(): LeaveEntry {
  const today = localDateKey();
  return {
    id: "",
    startDate: today,
    endDate: today,
    type: "full",
    minutes: 120,
    note: "",
    createdAt: "",
  };
}
