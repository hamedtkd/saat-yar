import { useMemo } from "react";
import { calendarMonthCells, emptyRecord, entryMinutes, localDateKey } from "@/lib/format";
import { getHolidayInfo } from "@/lib/holidays";
import { recordMatchesReportFilter } from "@/lib/report-filters";
import type { CalendarSystem } from "@/lib/i18n";
import { calc, minutesToTime } from "@/lib/time-engine";
import { getDailyTargetMinutes, getWorkScheduleDay } from "@/lib/work-schedule";
import { calculateLeaveEntitlementSummary } from "@/lib/leave-entitlement";
import type { AppData, ReportFilter } from "@/lib/types";

export function useControllerDerived(data: AppData, selectedDate: string, selectedProjectId: string, reportFilter: ReportFilter, calendar: CalendarSystem = "persian") {
  const selectedSchedule = getWorkScheduleDay(selectedDate, data.settings);
  const dailyTarget = getDailyTargetMinutes(selectedDate, data.settings);
  const storedRecord = data.records[selectedDate] ?? {
    ...emptyRecord(selectedDate, data.settings),
    lunchMinutes: selectedSchedule.lunchMinutes,
    lunchPaid: Boolean(selectedSchedule.lunchPaid),
  };
  const selectedHoliday = getHolidayInfo(selectedDate, {
    mode: data.settings.mode, manualHoliday: storedRecord.holiday,
    includeOfficialHolidays: data.settings.autoOfficialHolidays,
    includeWeeklyHoliday: data.settings.autoWeeklyHoliday, overrides: data.holidayOverrides,
  });
  const record = { ...storedRecord, holiday: selectedHoliday.isHoliday };
  const todayCalc = calc(record, dailyTarget);
  const suggestedExit = minutesToTime(calc({ ...record, start: record.start || selectedSchedule.start }, dailyTarget).plannedExit);
  const selectedMonthDates = useMemo(() => new Set(calendarMonthCells(selectedDate, calendar)
    .filter((cell) => cell.inMonth)
    .map((cell) => cell.key)), [calendar, selectedDate]);
  const monthRecords = useMemo(() => Object.values(data.records)
    .filter((item) => selectedMonthDates.has(item.date))
    .map((item) => ({ ...item, holiday: getHolidayInfo(item.date, {
      mode: data.settings.mode, manualHoliday: item.holiday,
      includeOfficialHolidays: data.settings.autoOfficialHolidays,
      includeWeeklyHoliday: data.settings.autoWeeklyHoliday, overrides: data.holidayOverrides,
    }).isHoliday }))
    .sort((a, b) => b.date.localeCompare(a.date)), [data, selectedMonthDates]);
  const monthStats = useMemo(() => monthRecords.reduce((acc, item) => {
    const target = getDailyTargetMinutes(item.date, data.settings);
    const result = calc(item, target);
    acc.worked += result.worked; acc.target += item.holiday ? 0 : target;
    acc.balance += result.balance; acc.breaks += result.breakMinutes + result.unpaidLunchMinutes;
    return acc;
  }, { worked: 0, target: 0, balance: 0, breaks: 0 }), [monthRecords, data.settings]);
  const activeEntry = data.timeEntries.find((entry) => !entry.endedAt);
  const activeBreak = record.breaks.find((item) => item.start && !item.end);
  const lunchRunning = Boolean(record.lunchStart && !record.lunchEnd);
  const leaveSummary = calculateLeaveEntitlementSummary(data, localDateKey());
  const usedLeave = leaveSummary.used;
  const leaveAvailable = leaveSummary.available;
  const selectedProject = data.projects.find((project) => project.id === selectedProjectId);
  const filteredMonthRecords = monthRecords.filter((item) => recordMatchesReportFilter(item, reportFilter, data.settings));
  const filteredEntries = data.timeEntries.filter((entry) => {
    const project = data.projects.find((item) => item.id === entry.projectId);
    const client = data.clients.find((item) => item.id === entry.clientId);
    const query = reportFilter.query.trim().toLocaleLowerCase("fa");
    const entryDate = localDateKey(new Date(entry.startedAt));
    return (reportFilter.clientId === "all" || entry.clientId === reportFilter.clientId) &&
      (reportFilter.projectId === "all" || entry.projectId === reportFilter.projectId) &&
      (reportFilter.billable === "all" || String(entry.billable) === reportFilter.billable) &&
      (!reportFilter.dateFrom || entryDate >= reportFilter.dateFrom) && (!reportFilter.dateTo || entryDate <= reportFilter.dateTo) &&
      (!query || entry.note.toLocaleLowerCase("fa").includes(query) || project?.name.toLocaleLowerCase("fa").includes(query) || client?.name.toLocaleLowerCase("fa").includes(query));
  });
  const reportBillable = filteredEntries.filter((entry) => entry.billable).reduce((sum, entry) => sum + entryMinutes(entry), 0);
  const reportIncome = filteredEntries.reduce((sum, entry) => sum + (entry.billable ? entryMinutes(entry) / 60 * entry.effectiveRate : 0), 0);
  return { selectedSchedule, dailyTarget, selectedHoliday, record, todayCalc, suggestedExit, monthRecords, monthStats,
    activeEntry, activeBreak, lunchRunning, usedLeave, leaveAvailable, leaveSummary, selectedProject, filteredMonthRecords, filteredEntries,
    reportBillable, reportIncome };
}
