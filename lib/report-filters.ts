import { calc } from "./time-engine.ts";
import { getRecordStatus } from "./record-health.ts";
import type { ReportFilter, Settings, WorkRecord } from "./types.ts";
import { getDailyTargetMinutes } from "./work-schedule.ts";

export function recordMatchesReportFilter(record: WorkRecord, filter: ReportFilter, settings: Settings) {
  const query = filter.query.trim().toLocaleLowerCase("fa");
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
    (!query || record.note.toLocaleLowerCase("fa").includes(query) || record.date.includes(query));
}
