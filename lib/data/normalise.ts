import type { AppData, Settings } from "../types";

export function normaliseData(value: AppData, defaults: Settings): AppData {
  return {
    settings: {
      ...defaults,
      ...(value.settings ?? {}),
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
          leaveMinutes: Math.max(0, record.leaveMinutes ?? 0),
          leaveType: record.leaveType ?? "none",
          note: record.note ?? "",
          holiday: Boolean(record.holiday),
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
  };
}
