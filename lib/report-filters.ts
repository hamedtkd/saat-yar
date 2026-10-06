import { calc } from "./time-engine.ts";
import { getRecordStatus } from "./record-health.ts";
import { localDateKey } from "./format.ts";
import type { AppData, Project, ReportFilter, Settings, TimeEntry, WorkRecord } from "./types.ts";
import { getFreelancerReportDescription } from "./freelancer-report-description.ts";
import { getDailyTargetMinutes } from "./work-schedule.ts";
import { getEmployeeReportDateSearchVariants } from "./employee-report-date.ts";

function normalizeSearchText(value: string) {
  return value.toLocaleLowerCase("fa")
    .replace(/[۰-۹٠-٩]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩".indexOf(digit) % 10))
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[،,./\\:_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function reportDateMatchesQuery(date: string, query: string) {
  if (!/\d/.test(query)) return false;
  const formattedDates = getEmployeeReportDateSearchVariants(date);
  return [date, ...formattedDates].some((value) => normalizeSearchText(value).includes(query));
}

export function normalizeReportDateRange(filter: ReportFilter, changedBoundary?: "from" | "to"): ReportFilter {
  if (!filter.dateFrom || !filter.dateTo || filter.dateFrom <= filter.dateTo) return filter;
  return changedBoundary === "to"
    ? { ...filter, dateFrom: "" }
    : { ...filter, dateTo: "" };
}

export function updateReportDateFrom(filter: ReportFilter, dateFrom: string): ReportFilter {
  return normalizeReportDateRange({ ...filter, dateFrom }, "from");
}

export function updateReportDateTo(filter: ReportFilter, dateTo: string): ReportFilter {
  return normalizeReportDateRange({ ...filter, dateTo }, "to");
}

export function updateReportClientFilter(filter: ReportFilter, clientId: string, projects: Project[]): ReportFilter {
  const selectedProject = projects.find((project) => project.id === filter.projectId);
  const projectStillSelectable = filter.projectId === "all" ||
    (Boolean(selectedProject) && (clientId === "all" || selectedProject?.clientId === clientId));
  return { ...filter, clientId, projectId: projectStillSelectable ? filter.projectId : "all" };
}

export function timeEntryMatchesReportFilter(entry: TimeEntry, filter: ReportFilter, data: Pick<AppData, "projects" | "clients">) {
  const project = data.projects.find((item) => item.id === entry.projectId);
  const client = data.clients.find((item) => item.id === entry.clientId);
  const query = filter.query.trim().toLocaleLowerCase("fa");
  const entryDate = localDateKey(new Date(entry.startedAt));
  const matchesQuery = !query ||
    getFreelancerReportDescription(entry).toLocaleLowerCase("fa").includes(query) ||
    project?.name.toLocaleLowerCase("fa").includes(query) ||
    client?.name.toLocaleLowerCase("fa").includes(query);
  return (filter.clientId === "all" || entry.clientId === filter.clientId) &&
    (filter.projectId === "all" || entry.projectId === filter.projectId) &&
    (filter.billable === "all" || String(entry.billable) === filter.billable) &&
    (!filter.dateFrom || entryDate >= filter.dateFrom) && (!filter.dateTo || entryDate <= filter.dateTo) &&
    matchesQuery;
}

export function recordMatchesReportFilter(record: WorkRecord, filter: ReportFilter, settings: Settings) {
  const query = normalizeSearchText(filter.query);
  const result = calc(record, getDailyTargetMinutes(record.date, settings));
  const health = getRecordStatus(record);
  const matchesStatus = filter.status === "all" ||
    (filter.status === "complete" && health.state === "complete") ||
    (filter.status === "incomplete" && (health.state === "incomplete" || health.state === "invalid")) ||
    (filter.status === "overtime" && result.balance > 0) ||
    (filter.status === "deficit" && result.balance < 0) ||
    (filter.status === "holiday" && record.holiday) ||
    (filter.status === "leave" && record.leaveMinutes > 0);

  return (!filter.dateFrom || record.date >= filter.dateFrom) &&
    (!filter.dateTo || record.date <= filter.dateTo) &&
    matchesStatus &&
    (!query || normalizeSearchText(record.note).includes(query) || reportDateMatchesQuery(record.date, query));
}
