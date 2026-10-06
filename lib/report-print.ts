import { localDateKey } from "./format.ts";
import type { MessageKey } from "./i18n/fa.ts";
import type { Mode, Project, ReportFilter, TimeEntry, WorkRecord } from "./types.ts";

export type ReportPrintFilter = { key: string; label: string; value: string };

type FilterLabels = {
  from: string;
  to: string;
  client: string;
  project: string;
  status: string;
  billable: string;
  search: string;
};

export function getAppliedReportFilters({
  mode,
  filters,
  clients,
  projects,
  labels,
  translate,
  formatDate,
}: {
  mode: Mode;
  filters: ReportFilter;
  clients: { id: string; name: string }[];
  projects: Project[];
  labels: FilterLabels;
  translate: (key: MessageKey) => string;
  formatDate: (date: string) => string;
}): ReportPrintFilter[] {
  const result: ReportPrintFilter[] = [];
  const add = (key: string, label: string, value: string) => {
    if (value) result.push({ key, label, value });
  };

  add("dateFrom", labels.from, filters.dateFrom ? formatDate(filters.dateFrom) : "");
  add("dateTo", labels.to, filters.dateTo ? formatDate(filters.dateTo) : "");

  if (mode !== "employee" && filters.clientId !== "all") {
    add("clientId", labels.client, clients.find((client) => client.id === filters.clientId)?.name ?? "");
  }
  if (mode !== "employee" && filters.projectId !== "all") {
    add("projectId", labels.project, projects.find((project) => project.id === filters.projectId)?.name ?? "");
  }
  if (mode === "employee" && filters.status !== "all") {
    const statusKeys: Record<Exclude<ReportFilter["status"], "all">, string> = {
      complete: "reports.filters.complete",
      incomplete: "reports.filters.incomplete",
      overtime: "common.overtime",
      deficit: "common.deficit",
      holiday: "reports.filters.holiday",
      leave: "reports.filters.leave",
    };
    add("status", labels.status, translate(statusKeys[filters.status] as MessageKey));
  }
  if (mode !== "employee" && filters.billable !== "all") {
    const billableLabelKey = filters.billable === "true"
      ? "common.billable"
      : filters.billable === "false"
        ? "common.nonBillable"
        : null;
    if (billableLabelKey) add("billable", labels.billable, translate(billableLabelKey));
  }

  add("query", labels.search, filters.query.trim());
  return result;
}

export function getReportPrintRange(
  mode: Mode,
  filters: ReportFilter,
  records: WorkRecord[],
  entries: TimeEntry[],
) {
  const keys = mode === "employee"
    ? records.map((record) => record.date)
    : entries.map((entry) => localDateKey(new Date(entry.startedAt)));
  const sorted = keys.filter(Boolean).sort((a, b) => a.localeCompare(b));
  return {
    from: filters.dateFrom || sorted[0] || "",
    to: filters.dateTo || sorted.at(-1) || "",
  };
}
