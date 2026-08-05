import { useMemo } from "react";
import { entryMinutes } from "@/lib/format";
import type { AppData } from "@/lib/types";

export function useClientMetrics(data: AppData) {
  return useMemo(() => ({
    activeClients: data.clients.filter((client) => !client.archived).length,
    activeProjects: data.projects.filter((project) => project.status === "active").length,
    trackedMinutes: data.timeEntries.reduce((sum, entry) => sum + entryMinutes(entry), 0),
    billableAmount: data.timeEntries.reduce(
      (sum, entry) => sum + (entry.billable ? entryMinutes(entry) / 60 * entry.effectiveRate : 0),
      0,
    ),
  }), [data.clients, data.projects, data.timeEntries]);
}
