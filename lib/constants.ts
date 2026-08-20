import type { AppData, LeaveEntry, Settings } from "./types.ts";
import { localDateKey } from "./format.ts";
import { createDefaultWeeklySchedule } from "./work-schedule.ts";
import { createCompleteAppData } from "./data/app-data-factory.ts";
import { clonePayrollPolicy, createPayrollPreset } from "./payroll-policy.ts";
import { LEGAL_MONTHLY_LEAVE_MINUTES } from "./leave-entitlement.ts";

export const defaultSettings: Settings = {
  name: "",
  onboarded: false,
  weeklyMinutes: 42 * 60 + 30,
  workDays: 5,
  weeklySchedule: createDefaultWeeklySchedule(),
  defaultStart: "07:30",
  defaultEnd: "16:15",
  lunchMinutes: 45,
  leaveBalanceMinutes: 0,
  monthlyLeaveMinutes: LEGAL_MONTHLY_LEAVE_MINUTES,
  salary: 30_000_000,
  overtimeMultiplier: 1.4,
  holidayMultiplier: 1.4,
  payrollComponents: [],
  payrollPolicy: createPayrollPreset("monthly-prorated", 30_000_000),
  autoOfficialHolidays: true,
  autoWeeklyHoliday: true,
  autoSaveSettings: false,
  notificationSettings: {
    enabled: false,
    openTimerReminderMinutes: 240,
    dailyTargetReminder: true,
    endOfDayReminder: true,
    breakReminder: { enabled: false, intervalMinutes: 60, onlyWhenTracking: true },
    quietHours: { enabled: false, start: "22:00", end: "07:00" },
    customReminders: [],
    snoozeMinutes: 30,
  },
  appearance: { mode: "system", preset: "violet", accent: "#8b5cf6", radius: "rounded", surface: "tinted" },
  mode: "employee",
  workTimingMode: "scheduled",
};

export const colors = ["#0969a9", "#f4a500", "#0a9d63", "#7d55b6", "#e76f1e", "#238d9a"];

export function createInitialData(options: { onboarded?: boolean } = {}): AppData {
  return createCompleteAppData({
    settings: {
      ...defaultSettings,
      onboarded: options.onboarded ?? defaultSettings.onboarded,
      weeklySchedule: Object.fromEntries(
        Object.entries(defaultSettings.weeklySchedule).map(([day, schedule]) => [day, { ...schedule }]),
      ) as Settings["weeklySchedule"],
      payrollComponents: defaultSettings.payrollComponents.map((component) => ({ ...component })),
      payrollPolicy: clonePayrollPolicy(defaultSettings.payrollPolicy),
      notificationSettings: {
        ...defaultSettings.notificationSettings,
        breakReminder: { ...defaultSettings.notificationSettings.breakReminder },
        quietHours: { ...defaultSettings.notificationSettings.quietHours },
        customReminders: defaultSettings.notificationSettings.customReminders.map((reminder) => ({ ...reminder })),
      },
      appearance: { ...defaultSettings.appearance },
    },
  });
}

export const initialData: AppData = createInitialData();

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
