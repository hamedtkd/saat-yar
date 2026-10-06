import assert from "node:assert/strict";
import test from "node:test";

import { createInitialData, defaultSettings } from "../lib/constants.ts";
import { recordMatchesReportFilter, timeEntryMatchesReportFilter, normalizeReportDateRange, updateReportClientFilter, updateReportDateFrom, updateReportDateTo } from "../lib/report-filters.ts";
import { selectReportRecords } from "../lib/report-records.ts";
import { formatEmployeeReportDate } from "../lib/employee-report-date.ts";
import type { Client, Project, ReportFilter, TimeEntry, WorkRecord } from "../lib/types.ts";
import { makeWorkRecord } from "./fixtures/work-record.ts";

const baseFilter: ReportFilter = {
  clientId: "all",
  projectId: "all",
  billable: "all",
  query: "",
  dateFrom: "",
  dateTo: "",
  status: "all",
};

function record(patch: Partial<WorkRecord> = {}): WorkRecord {
  return makeWorkRecord({
    date: "2026-08-03",
    start: "07:30",
    end: "16:15",
    lunchMinutes: 45,
    note: "جلسه برنامه‌ریزی",
    ...patch,
  });
}

function timeEntry(patch: Partial<TimeEntry> = {}): TimeEntry {
  return {
    id: "entry",
    clientId: "client",
    projectId: "project",
    task: "",
    startedAt: "2026-08-03T09:00:00",
    endedAt: null,
    note: "",
    billable: true,
    effectiveRate: 10,
    ...patch,
  };
}

const freelancerSearchData = {
  projects: [{ id: "project", clientId: "client", name: "Project North" }] as Project[],
  clients: [{ id: "client", name: "Client One" }] as Client[],
};

test("filters records by date range", () => {
  assert.equal(recordMatchesReportFilter(record(), { ...baseFilter, dateFrom: "2026-08-01", dateTo: "2026-08-10" }, defaultSettings), true);
  assert.equal(recordMatchesReportFilter(record(), { ...baseFilter, dateFrom: "2026-08-04" }, defaultSettings), false);
});

test("filters incomplete records", () => {
  assert.equal(recordMatchesReportFilter(record({ end: "" }), { ...baseFilter, status: "incomplete" }, defaultSettings), true);
  assert.equal(recordMatchesReportFilter(record(), { ...baseFilter, status: "incomplete" }, defaultSettings), false);
});

test("filters leave, holiday and text", () => {
  assert.equal(recordMatchesReportFilter(record({ leaveMinutes: 120, leaveType: "hourly" }), { ...baseFilter, status: "leave" }, defaultSettings), true);
  assert.equal(recordMatchesReportFilter(record({ holiday: true }), { ...baseFilter, status: "holiday" }, defaultSettings), true);
  assert.equal(recordMatchesReportFilter(record(), { ...baseFilter, query: "برنامه" }, defaultSettings), true);
});

test("employee report search matches ISO and visible Persian dates with localized digits", () => {
  const item = record({ date: "2026-10-05" });
  const visibleDate = formatEmployeeReportDate(item.date, "fa-IR", "persian");
  assert.equal(recordMatchesReportFilter(item, { ...baseFilter, query: "2026-10-05" }, defaultSettings), true);
  assert.equal(recordMatchesReportFilter(item, { ...baseFilter, query: visibleDate }, defaultSettings), true);
  assert.equal(recordMatchesReportFilter(item, { ...baseFilter, query: "۱۳ مهر ۱۴۰۵" }, defaultSettings), true);
  assert.equal(recordMatchesReportFilter(item, { ...baseFilter, query: "13 مهر 1405" }, defaultSettings), true);
});

test("employee report date labels include the year to distinguish multi-year rows", () => {
  const label = formatEmployeeReportDate("2026-10-05", "fa-IR", "persian");
  assert.match(label, /۱۴۰۵/);
});

test("date range updates preserve valid and same-day boundaries", () => {
  const normal = { ...baseFilter, dateFrom: "2026-10-01", dateTo: "2026-10-10" };
  assert.deepEqual(updateReportDateTo(updateReportDateFrom(baseFilter, normal.dateFrom), normal.dateTo), normal);
  const sameDay = updateReportDateTo(updateReportDateFrom(baseFilter, "2026-10-04"), "2026-10-04");
  assert.equal(sameDay.dateFrom, "2026-10-04");
  assert.equal(sameDay.dateTo, "2026-10-04");
});

test("the most recently edited boundary wins when From moves beyond To", () => {
  const before = { ...baseFilter, dateFrom: "2026-10-01", dateTo: "2026-10-10" };
  const after = updateReportDateFrom(before, "2026-10-20");
  assert.equal(after.dateFrom, "2026-10-20");
  assert.equal(after.dateTo, "");
});

test("the most recently edited boundary wins when To moves before From", () => {
  const before = { ...baseFilter, dateFrom: "2026-10-10", dateTo: "2026-10-20" };
  const after = updateReportDateTo(before, "2026-10-05");
  assert.equal(after.dateFrom, "");
  assert.equal(after.dateTo, "2026-10-05");
});

test("clearing either report date boundary remains valid", () => {
  const range = { ...baseFilter, dateFrom: "2026-10-10", dateTo: "2026-10-20" };
  assert.equal(updateReportDateFrom(range, "").dateFrom, "");
  assert.equal(updateReportDateTo(range, "").dateTo, "");
});

test("programmatically supplied invalid ranges normalize to a valid state", () => {
  const normalized = normalizeReportDateRange({ ...baseFilter, dateFrom: "2026-10-20", dateTo: "2026-10-05" });
  assert.deepEqual([normalized.dateFrom, normalized.dateTo], ["2026-10-20", ""]);
});

test("report records use the corrected open-ended range instead of returning a false empty result", () => {
  const data = createInitialData({ onboarded: true });
  data.settings.mode = "employee";
  data.settings.autoOfficialHolidays = false;
  data.settings.autoWeeklyHoliday = false;
  data.records["2026-10-20"] = makeWorkRecord({ date: "2026-10-20" });
  data.records["2026-10-21"] = makeWorkRecord({ date: "2026-10-21" });

  const validFilter = updateReportDateFrom({ ...baseFilter, dateFrom: "2026-10-01", dateTo: "2026-10-10" }, "2026-10-20");
  assert.deepEqual(selectReportRecords(data, validFilter).map((item) => item.date), ["2026-10-21", "2026-10-20"]);
});

test("changing Client clears a Project that is no longer selectable and removes it from filter state", () => {
  const projects = [
    { id: "a1", clientId: "a", name: "A1" },
    { id: "a2", clientId: "a", name: "A2" },
    { id: "b1", clientId: "b", name: "B1" },
  ] as Project[];
  const current = { ...baseFilter, clientId: "a", projectId: "a1" };

  const next = updateReportClientFilter(current, "b", projects);

  assert.equal(next.clientId, "b");
  assert.equal(next.projectId, "all");
  assert.notEqual(next.projectId, "a1");
});

test("Client scope changes preserve a Project only while it remains selectable", () => {
  const projects = [
    { id: "a1", clientId: "a", name: "A1" },
    { id: "b1", clientId: "b", name: "B1" },
  ] as Project[];

  const allClients = updateReportClientFilter({ ...baseFilter, clientId: "a", projectId: "a1" }, "all", projects);
  assert.equal(allClients.projectId, "a1");
  const matchingClient = updateReportClientFilter({ ...baseFilter, clientId: "all", projectId: "b1" }, "b", projects);
  assert.equal(matchingClient.projectId, "b1");
  const mismatchedClient = updateReportClientFilter(matchingClient, "a", projects);
  assert.equal(mismatchedClient.projectId, "all");
});

test("a valid Client and Project pair continues to filter report time entries", () => {
  const projects = [
    { id: "a1", clientId: "a", name: "A1" },
    { id: "b1", clientId: "b", name: "B1" },
  ] as Project[];
  const entries = [
    { id: "entry-a", clientId: "a", projectId: "a1", startedAt: "2026-08-03T09:00:00", endedAt: null, note: "", billable: true, effectiveRate: 10 },
    { id: "entry-b", clientId: "b", projectId: "b1", startedAt: "2026-08-03T09:00:00", endedAt: null, note: "", billable: true, effectiveRate: 10 },
  ] as TimeEntry[];
  const filter = { ...baseFilter, clientId: "b", projectId: "b1" };

  assert.deepEqual(entries.filter((entry) => timeEntryMatchesReportFilter(entry, filter, { projects, clients: [] })).map((entry) => entry.id), ["entry-b"]);
});

test("freelancer report search matches the visible note or task fallback", () => {
  const noteEntry = timeEntry({ note: "Client follow-up", task: "Other task" });
  const taskEntry = timeEntry({ note: "", task: "Implement dashboard" });

  assert.equal(timeEntryMatchesReportFilter(noteEntry, { ...baseFilter, query: "  FOLLOW  " }, freelancerSearchData), true);
  assert.equal(timeEntryMatchesReportFilter(taskEntry, { ...baseFilter, query: "dashboard" }, freelancerSearchData), true);
});

test("freelancer report search uses task fallback for absent or null legacy notes", () => {
  const absentNote = timeEntry({ task: "Implement dashboard", note: undefined as unknown as string });
  const nullNote = timeEntry({ task: "Implement dashboard", note: null as unknown as string });

  assert.equal(timeEntryMatchesReportFilter(absentNote, { ...baseFilter, query: "dashboard" }, freelancerSearchData), true);
  assert.equal(timeEntryMatchesReportFilter(nullNote, { ...baseFilter, query: "dashboard" }, freelancerSearchData), true);
});

test("freelancer report search does not match task hidden by a visible note", () => {
  const entry = timeEntry({ note: "Client meeting", task: "Implement dashboard" });

  assert.equal(timeEntryMatchesReportFilter(entry, { ...baseFilter, query: "dashboard" }, freelancerSearchData), false);
  assert.equal(timeEntryMatchesReportFilter(entry, { ...baseFilter, query: "meeting" }, freelancerSearchData), true);
});

test("freelancer report search treats whitespace-only notes as the visible description", () => {
  const entry = timeEntry({ note: "   ", task: "Dashboard" });

  assert.equal(timeEntryMatchesReportFilter(entry, { ...baseFilter, query: "Dashboard" }, freelancerSearchData), false);
});

test("freelancer report search matches Persian task fallback text", () => {
  const entry = timeEntry({ note: "", task: "پیگیری پروژه مشتری" });

  assert.equal(timeEntryMatchesReportFilter(entry, { ...baseFilter, query: "پروژه" }, freelancerSearchData), true);
});

test("freelancer report search preserves project and client matches with active filters", () => {
  const entry = timeEntry({ note: "", task: "Unrelated" });
  const clientFilter = { ...baseFilter, clientId: "client", projectId: "project", billable: "true", query: "client one", dateFrom: "2026-08-03", dateTo: "2026-08-03" };
  const projectFilter = { ...clientFilter, query: "project north" };

  assert.equal(timeEntryMatchesReportFilter(entry, clientFilter, freelancerSearchData), true);
  assert.equal(timeEntryMatchesReportFilter(entry, projectFilter, freelancerSearchData), true);
  assert.equal(timeEntryMatchesReportFilter(entry, { ...clientFilter, clientId: "other" }, freelancerSearchData), false);
  assert.equal(timeEntryMatchesReportFilter(entry, { ...clientFilter, projectId: "other" }, freelancerSearchData), false);
  assert.equal(timeEntryMatchesReportFilter(entry, { ...clientFilter, billable: "false" }, freelancerSearchData), false);
  assert.equal(timeEntryMatchesReportFilter(entry, { ...clientFilter, dateFrom: "2026-08-04" }, freelancerSearchData), false);
});

test("empty and whitespace-only freelancer search queries preserve the full result set", () => {
  const entry = timeEntry({ note: "", task: "Implement dashboard" });

  assert.equal(timeEntryMatchesReportFilter(entry, baseFilter, freelancerSearchData), true);
  assert.equal(timeEntryMatchesReportFilter(entry, { ...baseFilter, query: "   " }, freelancerSearchData), true);
});
