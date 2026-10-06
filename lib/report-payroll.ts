import { calculatePayrollWithPolicy } from "./payroll-engine.ts";
import { derivePayrollPeriodFacts } from "./payroll-period.ts";
import { getPayrollPolicy } from "./payroll.ts";
import { getDailyTargetMinutes } from "./work-schedule.ts";
import type { AppData, ReportFilter, WorkRecord } from "./types.ts";

type DateRange = Pick<ReportFilter, "dateFrom" | "dateTo">;

function allDataDateBounds(data: AppData) {
  const dates = Object.values(data.records).map((record) => record.date).sort();
  return { first: dates[0] ?? "", last: dates.at(-1) ?? "" };
}

function reportBounds(data: AppData, records: WorkRecord[], range?: DateRange) {
  const dataBounds = allDataDateBounds(data);
  const from = range?.dateFrom || (range?.dateTo ? dataBounds.first : "");
  const to = range?.dateTo || (range?.dateFrom ? dataBounds.last : "");
  if (from || to) return { from, to };
  const dates = records.map((record) => record.date).sort();
  return { from: dates[0] ?? "", to: dates.at(-1) ?? "" };
}

function monthKeys(from: string, to: string, records: WorkRecord[]) {
  const start = from || records.map((record) => record.date).sort()[0] || "";
  const end = to || records.map((record) => record.date).sort().at(-1) || "";
  if (!start || !end || start > end) return [];
  const keys: string[] = [];
  let year = Number(start.slice(0, 4));
  let month = Number(start.slice(5, 7));
  const endYear = Number(end.slice(0, 4));
  const endMonth = Number(end.slice(5, 7));
  while (year < endYear || (year === endYear && month <= endMonth)) {
    keys.push(`${year}-${String(month).padStart(2, "0")}`);
    month += 1;
    if (month === 13) { month = 1; year += 1; }
  }
  return keys;
}

function scheduledMinutesInRange(month: string, settings: AppData["settings"], from: string, to: string) {
  const year = Number(month.slice(0, 4));
  const monthNumber = Number(month.slice(5, 7));
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  let fullMonth = 0;
  let selected = 0;
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${month}-${String(day).padStart(2, "0")}`;
    const target = getDailyTargetMinutes(date, settings);
    fullMonth += target;
    if ((!from || date >= from) && (!to || date <= to)) selected += target;
  }
  return { fullMonth, ratio: fullMonth ? Math.min(1, selected / fullMonth) : 0 };
}

function emptyPayroll(settings: AppData["settings"]) {
  return calculatePayrollWithPolicy({ ...getPayrollPolicy(settings), baseAmount: 0 }, {
    workedMinutes: 0,
    targetMinutes: 0,
    overtimeMinutes: 0,
    deficitMinutes: 0,
    holidayMinutes: 0,
    components: [],
  });
}

export function calculateReportPayroll(data: AppData, records: WorkRecord[], range?: DateRange) {
  const bounds = reportBounds(data, records, range);
  const months = monthKeys(bounds.from, bounds.to, records);
  if (!months.length) return emptyPayroll(data.settings);

  const policy = getPayrollPolicy(data.settings);
  const scheduleFrom = range?.dateFrom || (range?.dateTo ? bounds.from : "");
  const scheduleTo = range?.dateTo || (range?.dateFrom ? bounds.to : "");
  const results = months.map((month) => {
    const monthRecords = records.filter((record) => record.date.startsWith(month));
    const schedule = scheduledMinutesInRange(month, data.settings, scheduleFrom, scheduleTo);
    const monthPolicy = {
      ...policy,
      baseAmount: policy.baseMode === "monthly-fixed" ? policy.baseAmount * schedule.ratio : policy.baseAmount,
    };
    const facts = derivePayrollPeriodFacts(monthRecords, data.settings);
    const components = data.settings.payrollComponents.map((component) => ({
      ...component,
      amount: component.amount * schedule.ratio,
    }));
    return calculatePayrollWithPolicy(monthPolicy, {
      ...facts,
      targetMinutes: schedule.fullMonth,
      components,
    });
  });

  const sum = (key: "regularPay" | "overtimePay" | "holidayPay" | "deficitDeduction" | "earnings" | "deductions" | "gross" | "totalDeductions" | "net") =>
    results.reduce((total, item) => total + item[key], 0);
  const targetTotal = months.reduce((total, month) => total + scheduledMinutesInRange(month, data.settings, scheduleFrom, scheduleTo).fullMonth, 0);
  const breakdown = results[0].breakdown.map((line) => ({
    ...line,
    amount: results.reduce((total, result) => total + (result.breakdown.find((item) => item.key === line.key)?.amount ?? 0), 0),
  })) as unknown as typeof results[number]["breakdown"];

  return {
    regularPay: sum("regularPay"), overtimePay: sum("overtimePay"), holidayPay: sum("holidayPay"),
    deficitDeduction: sum("deficitDeduction"), earnings: sum("earnings"), deductions: sum("deductions"),
    gross: sum("gross"), totalDeductions: sum("totalDeductions"), net: sum("net"),
    baseMinuteRate: targetTotal ? results.reduce((total, item, index) => total + item.baseMinuteRate * scheduledMinutesInRange(months[index], data.settings, scheduleFrom, scheduleTo).fullMonth, 0) / targetTotal : 0,
    breakdown,
  };
}
