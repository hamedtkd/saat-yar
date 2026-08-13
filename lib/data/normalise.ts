import type { AppData, Settings, WeekdayKey } from "../types.ts";
import { getConfiguredWorkMinutes, weekdayOrder } from "../work-schedule.ts";
import { createCompleteAppData } from "./app-data-factory.ts";
import { normalizePayrollPolicy } from "../payroll-policy.ts";
import { normalizeLeaveSettings } from "../leave-entitlement.ts";

export function normaliseData(value: AppData, defaults: Settings): AppData {
  const incomingSettings = value.settings ?? defaults;
  const incomingSchedule = incomingSettings.weeklySchedule ?? {};
  const leaveSettings = normalizeLeaveSettings(incomingSettings);
  const workTimingMode = incomingSettings.workTimingMode === "flexible" ? "flexible" : "scheduled";
  const weeklySchedule = Object.fromEntries(
    weekdayOrder.map((day) => {
      const merged = {
        ...defaults.weeklySchedule[day],
        ...(incomingSchedule[day as WeekdayKey] ?? {}),
        lunchPaid: Boolean(incomingSchedule[day as WeekdayKey]?.lunchPaid),
      };
      return [day, {
        ...merged,
        targetMinutes: Number.isFinite(merged.targetMinutes)
          ? Math.max(0, Math.round(merged.targetMinutes))
          : getConfiguredWorkMinutes(merged),
      }];
    }),
  ) as Settings["weeklySchedule"];

  return createCompleteAppData({
    settings: {
      ...defaults,
      ...incomingSettings,
      weeklySchedule,
      workTimingMode,
      ...leaveSettings,
      notificationSettings: {
        ...defaults.notificationSettings,
        ...(incomingSettings.notificationSettings ?? {}),
        breakReminder: {
          ...defaults.notificationSettings.breakReminder,
          ...(incomingSettings.notificationSettings?.breakReminder ?? {}),
        },
      },
      appearance: { ...defaults.appearance, ...(incomingSettings.appearance ?? {}) },
      payrollPolicy: normalizePayrollPolicy(incomingSettings.payrollPolicy ?? defaults.payrollPolicy),
    },
    records: Object.fromEntries(
      Object.entries(value.records ?? {}).map(([date, record]) => [
        date,
        {
          ...record,
          date: record.date || date,
          lunchMinutes: Math.max(0, record.lunchMinutes ?? defaults.lunchMinutes),
          lunchPaid: Boolean(record.lunchPaid),
          breaks: (record.breaks ?? []).map((item) => ({
            ...item,
            paid: Boolean(item.paid),
          })),
          activitySegments: (record.activitySegments ?? []).map((item) => ({
            ...item,
            projectId: item.projectId || undefined,
          })),
          leaveMinutes: Math.max(0, record.leaveMinutes ?? 0),
          leaveType: record.leaveType ?? "none",
          note: record.note ?? "",
          holiday: Boolean(record.holiday),
          updatedAt: record.updatedAt,
          manuallyEdited: Boolean(record.manuallyEdited),
        },
      ]),
    ),
    leaves: value.leaves ?? [],
    clients: (value.clients ?? []).map((client) => ({
      ...client,
      archived: Boolean(client.archived),
    })),
    projects: (value.projects ?? []).map((project) => ({
      ...project,
      status: project.status ?? "active",
      billable: project.billable ?? true,
    })),
    timeEntries: value.timeEntries ?? [],
    expenses: (value.expenses ?? []).map((expense) => ({
      ...expense,
      amount: Math.max(0, expense.amount ?? 0),
      category: expense.category ?? "other",
      createdAt: expense.createdAt ?? new Date(`${expense.date}T12:00:00`).toISOString(),
    })),
    invoices: (value.invoices ?? []).map((invoice) => ({
      ...invoice,
      status: invoice.status ?? "draft",
      lines: (invoice.lines ?? []).map((line) => ({
        ...line,
        quantity: Math.max(0, line.quantity ?? 0),
        unitPrice: Math.max(0, line.unitPrice ?? 0),
      })),
      discount: Math.max(0, invoice.discount ?? 0),
      taxPercent: Math.max(0, invoice.taxPercent ?? 0),
      note: invoice.note ?? "",
      createdAt: invoice.createdAt ?? new Date(`${invoice.issuedAt}T12:00:00`).toISOString(),
    })),
    holidayOverrides: (value.holidayOverrides ?? []).map((item) => ({
      ...item,
      isHoliday: item.isHoliday !== false,
    })),
    deletedRecords: (value.deletedRecords ?? []).map((item) => ({
      ...item,
      record: {
        ...item.record,
        breaks: (item.record.breaks ?? []).map((entry) => ({ ...entry })),
        activitySegments: (item.record.activitySegments ?? []).map((entry) => ({ ...entry })),
      },
    })),
  });
}
