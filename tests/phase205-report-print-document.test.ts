import assert from "node:assert/strict";
import test from "node:test";

import { localDateKey } from "../lib/format.ts";
import { getAppliedReportFilters, getReportPrintRange } from "../lib/report-print.ts";
import type { Project, ReportFilter, TimeEntry } from "../lib/types.ts";

const labels = {
  from: "From",
  to: "To",
  client: "Client",
  project: "Project",
  status: "Status",
  billable: "Billing status",
  search: "Search",
};
const filterDefaults: ReportFilter = {
  clientId: "all",
  projectId: "all",
  billable: "all",
  query: "",
  dateFrom: "",
  dateTo: "",
  status: "all",
};
const clients = [{ id: "client-1", name: "نمونه مشتری", color: "#000", archived: false }];
const projects: Project[] = [{
  id: "project-1", clientId: "client-1", name: "پروژه نمونه", rate: 100, color: "#000", status: "active",
}];
const translate = (key: string) => ({
  "reports.filters.complete": "Complete record",
  "common.billable": "Billable",
  "common.nonBillable": "Non-billable",
}[key] ?? key);

test("print metadata includes active freelancer date, client, project, billing and search filters", () => {
  const result = getAppliedReportFilters({
    mode: "freelancer",
    filters: { ...filterDefaults, dateFrom: "2026-03-01", dateTo: "2026-03-31", clientId: "client-1", projectId: "project-1", billable: "true", query: "  طراحی  " },
    clients,
    projects,
    labels,
    translate,
    formatDate: (value) => `localized:${value}`,
  });
  assert.deepEqual(result, [
    { key: "dateFrom", label: "From", value: "localized:2026-03-01" },
    { key: "dateTo", label: "To", value: "localized:2026-03-31" },
    { key: "clientId", label: "Client", value: "نمونه مشتری" },
    { key: "projectId", label: "Project", value: "پروژه نمونه" },
    { key: "billable", label: "Billing status", value: "Billable" },
    { key: "query", label: "Search", value: "طراحی" },
  ]);
});

test("print metadata omits defaults and safely ignores unresolved related entities", () => {
  const inactive = getAppliedReportFilters({
    mode: "freelancer", filters: filterDefaults, clients, projects, labels, translate, formatDate: (value) => value,
  });
  assert.deepEqual(inactive, []);
  const staleIds = getAppliedReportFilters({
    mode: "freelancer",
    filters: { ...filterDefaults, clientId: "deleted-client", projectId: "deleted-project" },
    clients,
    projects,
    labels,
    translate,
    formatDate: (value) => value,
  });
  assert.deepEqual(staleIds, []);
});

test("employee print metadata localizes its active status filter", () => {
  const result = getAppliedReportFilters({
    mode: "employee", filters: { ...filterDefaults, status: "complete" }, clients, projects, labels, translate, formatDate: (value) => value,
  });
  assert.deepEqual(result, [{ key: "status", label: "Status", value: "Complete record" }]);
});

test("freelancer print range uses the same local calendar date as report filtering", () => {
  const entry: TimeEntry = {
    id: "entry-1", clientId: "client-1", projectId: "project-1", startedAt: "2026-03-20T00:30:00+03:30",
    endedAt: null, note: "", billable: true, effectiveRate: 100,
  };
  const expectedLocalDay = localDateKey(new Date(entry.startedAt));
  const range = getReportPrintRange("freelancer", filterDefaults, [], [entry]);
  assert.equal(range.from, expectedLocalDay);
  assert.equal(range.to, expectedLocalDay);
});
