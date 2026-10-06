import { useMemo } from "react";
import { calendarMonthCells, emptyRecord, entryMinutes, localDateKey } from "@/lib/format";
import { getHolidayInfo } from "@/lib/holidays";
import { selectReportRecords } from "@/lib/report-records";
import { timeEntryMatchesReportFilter } from "@/lib/report-filters";
import type { CalendarSystem } from "@/lib/i18n";
import { calc, minutesToTime } from "@/lib/time-engine";
import { getDailyTargetMinutes, getWorkScheduleDay } from "@/lib/work-schedule";
import { calculateLeaveEntitlementSummary, getEffectiveWorkRecordForDate } from "@/lib/leave-entitlement";
import { getActiveActivitySegment } from "@/lib/activity-segments";
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
  const monthRecords = useMemo(() => [...selectedMonthDates]
    .map((date) => getEffectiveWorkRecordForDate(date, data))
    .filter((item) => Boolean(data.records[item.date]) || item.leaveType !== "none" || item.leaveMinutes > 0)
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
  const activeActivitySegment = getActiveActivitySegment(record);
  const lunchRunning = Boolean(record.lunchStart && !record.lunchEnd);
  const leaveSummary = calculateLeaveEntitlementSummary(data, localDateKey());
  const usedLeave = leaveSummary.used;
  const leaveAvailable = leaveSummary.available;
  const selectedProject = data.projects.find((project) => project.id === selectedProjectId);
  const reportRecords = useMemo(() => selectReportRecords(data, reportFilter), [data, reportFilter]);
  const filteredEntries = data.timeEntries.filter((entry) => timeEntryMatchesReportFilter(entry, reportFilter, data));
  const reportBillable = filteredEntries.filter((entry) => entry.billable).reduce((sum, entry) => sum + entryMinutes(entry), 0);
  const reportIncome = filteredEntries.reduce((sum, entry) => sum + (entry.billable ? entryMinutes(entry) / 60 * entry.effectiveRate : 0), 0);
  return { selectedSchedule, dailyTarget, selectedHoliday, record, todayCalc, suggestedExit, monthRecords, monthStats,
    activeEntry, activeBreak, activeActivitySegment, lunchRunning, usedLeave, leaveAvailable, leaveSummary, selectedProject, reportRecords, filteredEntries,
    reportBillable, reportIncome };
}
