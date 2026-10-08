import { jalaliParts } from "./format.ts";
import { getLeaveEntryUsedMinutes } from "./leave-entitlement.ts";
import type { AppData, LeaveBalanceEvent, LeavePolicyVersion, Settings } from "./types.ts";

export type LeaveMonthBalance = {
  month: number;
  accrued: number;
  used: number;
  adjustment: number;
  carryForward: number;
  cashOut: number;
  closing: number;
  future: boolean;
};

export type LeaveLedgerSummary = {
  year: number;
  currentMonth: number;
  monthlyEntitlement: number;
  annualPolicyMaximum: number;
  accruedThisYear: number;
  carryover: number;
  used: number;
  adjustments: number;
  cashOut: number;
  available: number;
  monthlyBreakdown: LeaveMonthBalance[];
};

function monthParts(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : jalaliParts(date);
}

function normaliseMinutes(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

export function normalizeLeavePolicies(value: unknown): LeavePolicyVersion[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw, index) => {
    if (!raw || typeof raw !== "object") return [];
    const item = raw as Partial<LeavePolicyVersion>;
    if (!Number.isInteger(item.effectiveYear) || !Number.isInteger(item.effectiveMonth) || !Number.isFinite(item.monthlyMinutes)) return [];
    const month = Math.min(12, Math.max(1, item.effectiveMonth as number));
    return [{
      ...item,
      id: typeof item.id === "string" && item.id.trim() ? item.id : `leave-policy-${index}`,
      effectiveYear: item.effectiveYear as number,
      effectiveMonth: month,
      monthlyMinutes: normaliseMinutes(item.monthlyMinutes),
      createdAt: typeof item.createdAt === "string" ? item.createdAt : "1970-01-01T00:00:00.000Z",
    } as LeavePolicyVersion];
  });
}

export function normalizeLeaveEvents(value: unknown): LeaveBalanceEvent[] {
  if (!Array.isArray(value)) return [];
  return value.reduce<LeaveBalanceEvent[]>((events, raw, index) => {
    if (!raw || typeof raw !== "object") return events;
    const item = raw as Record<string, unknown>;
    const id = typeof item.id === "string" && item.id.trim() ? item.id : `leave-event-${index}`;
    const note = typeof item.note === "string" ? item.note.slice(0, 240) : "";
    const createdAt = typeof item.createdAt === "string" ? item.createdAt : "1970-01-01T00:00:00.000Z";
    if (item.type === "adjustment") {
      const parts = typeof item.date === "string" ? monthParts(item.date) : null;
      const minutes = typeof item.minutes === "number" && Number.isFinite(item.minutes) ? Math.trunc(item.minutes) : 0;
      if (!parts || minutes === 0) return events;
      events.push({ id, type: "adjustment", date: item.date as string, jalaliYear: parts.year, minutes, note, createdAt });
      return events;
    }
    if (item.type === "carry-forward") {
      if (!Number.isInteger(item.sourceYear) || !Number.isInteger(item.destinationYear) || item.destinationYear !== (item.sourceYear as number) + 1) return events;
      const minutes = normaliseMinutes(item.minutes);
      if (minutes === 0) return events;
      events.push({ id, type: "carry-forward", sourceYear: item.sourceYear as number, destinationYear: item.destinationYear as number, minutes, note, createdAt, ...(typeof item.settlementId === "string" ? { settlementId: item.settlementId } : {}) });
      return events;
    }
    if (item.type === "cash-out") {
      const minutes = normaliseMinutes(item.minutes);
      if (!Number.isInteger(item.jalaliYear) || minutes === 0 || typeof item.settlementId !== "string") return events;
      events.push({ id, type: "cash-out", jalaliYear: item.jalaliYear as number, minutes, note, createdAt, settlementId: item.settlementId });
      return events;
    }
    return events;
  }, []);
}

function policyForMonth(policies: LeavePolicyVersion[], year: number, month: number) {
  const eligible = policies.filter((policy) => policy.effectiveYear < year || (policy.effectiveYear === year && policy.effectiveMonth <= month));
  return eligible.sort((left, right) => left.effectiveYear - right.effectiveYear || left.effectiveMonth - right.effectiveMonth || left.createdAt.localeCompare(right.createdAt)).at(-1)?.monthlyMinutes ?? 0;
}

function monthOfAdjustment(event: Extract<LeaveBalanceEvent, { type: "adjustment" }>) {
  return monthParts(event.date)?.month ?? 0;
}

function referenceDateForYear(data: AppData, year: number) {
  return [...Object.keys(data.records), ...data.leaves.map((entry) => entry.startDate)].find((date) => monthParts(date)?.year === year) ?? "";
}

export function calculateLeaveYearSummary(data: AppData, year: number, throughMonth = 12, suppliedReferenceDate?: string): LeaveLedgerSummary {
  const monthLimit = Math.min(12, Math.max(0, Math.trunc(throughMonth)));
  const referenceDate = suppliedReferenceDate || referenceDateForYear(data, year);
  const monthlyEntitlement = Math.round(data.settings.monthlyLeaveMinutes);
  const policies = normalizeLeavePolicies(data.settings.leavePolicies);
  const events = normalizeLeaveEvents(data.settings.leaveEvents);
  const usedByMonth = Array.from({ length: 12 }, (_, monthIndex) => data.leaves.reduce((sum, entry) => {
    const used = referenceDate ? getLeaveEntryUsedMinutes(entry, data, referenceDate, monthIndex + 1) : 0;
    return sum + used;
  }, 0));
  const adjustmentByMonth = Array(12).fill(0) as number[];
  const carryByMonth = Array(12).fill(0) as number[];
  const cashOutByMonth = Array(12).fill(0) as number[];
  for (const event of events) {
    if (event.type === "adjustment" && event.jalaliYear === year) adjustmentByMonth[monthOfAdjustment(event) - 1] += event.minutes;
    if (event.type === "carry-forward") {
      if (event.destinationYear === year) carryByMonth[0] += event.minutes;
      if (event.sourceYear === year) carryByMonth[11] -= event.minutes;
    }
    if (event.type === "cash-out" && event.jalaliYear === year) cashOutByMonth[11] += event.minutes;
  }
  const monthlyBreakdown: LeaveMonthBalance[] = [];
  let closing = 0;
  let accruedThisYear = 0;
  let used = 0;
  let adjustments = 0;
  let carryover = 0;
  let cashOut = 0;
  for (let month = 1; month <= 12; month += 1) {
    const future = month > monthLimit;
    const accrued = future ? 0 : policyForMonth(policies, year, month);
    const monthUsed = future ? 0 : usedByMonth[month - 1];
    const adjustment = future ? 0 : adjustmentByMonth[month - 1];
    const carryForward = future ? 0 : carryByMonth[month - 1];
    const monthCashOut = future ? 0 : cashOutByMonth[month - 1];
    accruedThisYear += accrued;
    used += monthUsed;
    adjustments += adjustment;
    if (month === 1) carryover += Math.max(0, carryForward);
    cashOut += monthCashOut;
    closing += accrued + monthUsed * -1 + adjustment + carryForward - monthCashOut;
    monthlyBreakdown.push({ month, accrued, used: monthUsed, adjustment, carryForward, cashOut: monthCashOut, closing, future });
  }
  const currentPolicy = policyForMonth(policies, year, Math.max(1, monthLimit)) || monthlyEntitlement;
  return {
    year,
    currentMonth: monthLimit,
    monthlyEntitlement: currentPolicy,
    annualPolicyMaximum: currentPolicy * 12,
    accruedThisYear,
    carryover,
    used,
    adjustments,
    cashOut,
    available: closing,
    monthlyBreakdown,
  };
}

export function calculateLeaveLedgerSummary(data: AppData, referenceDate: string): LeaveLedgerSummary {
  const parts = monthParts(referenceDate);
  if (!parts) return calculateLeaveYearSummary(data, 0, 0);
  return calculateLeaveYearSummary(data, parts.year, parts.month, referenceDate);
}

export function setMonthlyLeavePolicy(data: AppData, monthlyMinutes: number, effectiveDate: string): AppData {
  const parts = monthParts(effectiveDate);
  if (!parts || !Number.isFinite(monthlyMinutes) || monthlyMinutes < 0) return data;
  const minutes = Math.round(monthlyMinutes);
  const policy: LeavePolicyVersion = {
    id: `leave-policy-${parts.year}-${parts.month}-${Date.now()}`,
    effectiveYear: parts.year,
    effectiveMonth: parts.month,
    monthlyMinutes: minutes,
    createdAt: new Date().toISOString(),
  };
  return { ...data, settings: { ...data.settings, monthlyLeaveMinutes: minutes, leavePolicies: [...data.settings.leavePolicies, policy] } };
}

export function appendLeaveAdjustment(data: AppData, minutes: number, date: string, note: string): AppData {
  const parts = monthParts(date);
  if (!parts || !Number.isInteger(minutes) || minutes === 0) return data;
  const event: LeaveBalanceEvent = { id: `leave-adjustment-${Date.now()}-${Math.random()}`, type: "adjustment", date, jalaliYear: parts.year, minutes, note: note.trim().slice(0, 240), createdAt: new Date().toISOString() };
  return { ...data, settings: { ...data.settings, leaveEvents: [...data.settings.leaveEvents, event] } };
}

export function appendLeaveCarryForward(data: AppData, sourceYear: number, minutes: number, note: string): AppData | null {
  if (!Number.isInteger(sourceYear) || !Number.isInteger(minutes) || minutes <= 0) return null;
  const destinationYear = sourceYear + 1;
  if (data.settings.leaveEvents.some((event) => (event.type === "carry-forward" && event.sourceYear === sourceYear) || (event.type === "cash-out" && event.jalaliYear === sourceYear))) return null;
  const event: LeaveBalanceEvent = { id: `leave-carry-${Date.now()}-${Math.random()}`, type: "carry-forward", sourceYear, destinationYear, minutes, note: note.trim().slice(0, 240), createdAt: new Date().toISOString() };
  return { ...data, settings: { ...data.settings, leaveEvents: [...data.settings.leaveEvents, event] } };
}

export function settleLeaveYear(data: AppData, sourceYear: number, carryMinutes: number, cashOutMinutes: number, note: string): AppData | null {
  if (!Number.isInteger(sourceYear) || !Number.isInteger(carryMinutes) || !Number.isInteger(cashOutMinutes) || carryMinutes < 0 || cashOutMinutes < 0 || carryMinutes + cashOutMinutes <= 0) return null;
  if (data.settings.leaveEvents.some((event) => (event.type === "cash-out" && event.jalaliYear === sourceYear) || (event.type === "carry-forward" && event.sourceYear === sourceYear))) return null;
  const closing = calculateLeaveYearSummary(data, sourceYear, 12).available;
  if (carryMinutes + cashOutMinutes > Math.max(0, closing)) return null;
  const settlementId = `leave-settlement-${sourceYear}`;
  const createdAt = new Date().toISOString();
  const detail = note.trim().slice(0, 240);
  const events: LeaveBalanceEvent[] = [];
  if (carryMinutes > 0) events.push({ id: `${settlementId}-carry`, type: "carry-forward", sourceYear, destinationYear: sourceYear + 1, minutes: carryMinutes, note: detail, createdAt, settlementId });
  if (cashOutMinutes > 0) events.push({ id: `${settlementId}-cash`, type: "cash-out", jalaliYear: sourceYear, minutes: cashOutMinutes, note: detail, createdAt, settlementId });
  return { ...data, settings: { ...data.settings, leaveEvents: [...data.settings.leaveEvents, ...events] } };
}

export function hasSettlementForYear(settings: Pick<Settings, "leaveEvents">, year: number) {
  return settings.leaveEvents.some((event) => (event.type === "cash-out" && event.jalaliYear === year) || (event.type === "carry-forward" && event.sourceYear === year));
}
