import { shiftDateKey } from "./format.ts";
import { getEffectiveWorkRecordForDate } from "./leave-entitlement.ts";
import { recordMatchesReportFilter } from "./report-filters.ts";
import type { AppData, ReportFilter, WorkRecord } from "./types.ts";

// Guard against unbounded leave ranges, mirroring the entitlement engine.
const MAX_LEAVE_RANGE_DAYS = 370;
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Every date the data source can speak about, plus the span they cover.
 *
 * Stored work records and leave entries (leave ranges materialise records without a stored record)
 * are the only sources here, so the result never depends on UI navigation.
 */
function collectDataSourceDates(data: AppData) {
  const dates = new Set<string>();
  let min = "";
  let max = "";
  const track = (date: string) => {
    dates.add(date);
    if (!min || date < min) min = date;
    if (!max || date > max) max = date;
  };

  for (const date of Object.keys(data.records)) track(date);
  for (const leave of data.leaves) {
    if (!leave.startDate) continue;
    if (leave.type === "hourly" || !leave.endDate || leave.endDate < leave.startDate) {
      track(leave.startDate);
      continue;
    }
    let cursor = leave.startDate;
    for (let index = 0; index < MAX_LEAVE_RANGE_DAYS && cursor <= leave.endDate; index += 1) {
      track(cursor);
      cursor = shiftDateKey(cursor, 1);
    }
  }

  return { dates, min, max };
}

/**
 * Deterministic, bounded set of days to probe for holidays that have no stored record or leave.
 *
 * Boundary strategy (keeps candidate generation bounded, never enumerates an unbounded calendar):
 * - both `dateFrom` and `dateTo` → the complete explicit finite report range;
 * - one boundary → the explicit boundary clamped to the known data span on the open side,
 *   then capped at 370 days;
 * - no boundary → no scan (never generate synthetic holiday dates for a span the user did not ask for).
 */
function collectHolidayScanDates(filter: ReportFilter, dataMin: string, dataMax: string): string[] {
  const hasFrom = Boolean(filter.dateFrom);
  const hasTo = Boolean(filter.dateTo);
  if (!hasFrom && !hasTo) return [];

  const start = hasFrom ? filter.dateFrom : dataMin;
  const end = hasTo ? filter.dateTo : dataMax;
  if (!DATE_KEY_PATTERN.test(start) || !DATE_KEY_PATTERN.test(end) || start > end) return [];

  const dates: string[] = [];
  let cursor = start;
  let index = 0;
  while (cursor <= end && (hasFrom && hasTo || index < MAX_LEAVE_RANGE_DAYS)) {
    dates.push(cursor);
    const next = shiftDateKey(cursor, 1);
    if (next <= cursor) break; // defensive: never loop on a non-advancing date key
    cursor = next;
    index += 1;
  }
  return dates;
}

/**
 * Canonical employee (work record) report dataset.
 *
 * It is derived from the whole {@link AppData} source and bounded only by the report filter's
 * `dateFrom` / `dateTo` range, so it is completely independent from the Month/Today
 * `selectedDate`. Every Reports consumer (summary, charts, table, CSV/Excel/print) must use
 * this single dataset so their numbers can never diverge.
 *
 * When the Holiday status filter is active, configured holidays inside the report range are
 * materialised through the regular {@link getEffectiveWorkRecordForDate} rules even when no
 * stored record or leave exists for that date, so the Holiday report is complete.
 */
export function selectReportRecords(data: AppData, filter: ReportFilter): WorkRecord[] {
  const source = collectDataSourceDates(data);
  const candidateDates = new Set(source.dates);
  if (filter.status === "holiday") {
    for (const date of collectHolidayScanDates(filter, source.min, source.max)) candidateDates.add(date);
  }

  const records: WorkRecord[] = [];
  for (const date of candidateDates) {
    const record = getEffectiveWorkRecordForDate(date, data);
    const hasContent = Boolean(data.records[date]) || record.leaveType !== "none" || record.leaveMinutes > 0 || record.holiday;
    if (!hasContent) continue;
    if (!recordMatchesReportFilter(record, filter, data.settings)) continue;
    records.push(record);
  }
  records.sort((first, second) => second.date.localeCompare(first.date));
  return records;
}
