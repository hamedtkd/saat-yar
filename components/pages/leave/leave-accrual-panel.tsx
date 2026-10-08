"use client";

import { useState } from "react";
import { Check, CircleDollarSign, History, MinusCircle, PlusCircle, Settings2 } from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";
import { SurfaceCard } from "@/components/common/surface-card";
import { useBusinessUi } from "@/components/i18n/use-business-ui";
import { JalaliDatePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { localDateKey } from "@/lib/format";
import { appendLeaveAdjustment, appendLeaveCarryForward, calculateLeaveYearSummary, hasSettlementForYear, setMonthlyLeavePolicy, settleLeaveYear } from "@/lib/leave-ledger";
import type { LeaveEntitlementSummary } from "@/lib/leave-entitlement";
import type { AppData } from "@/lib/types";

const ledgerColumns = ["month", "accrued", "used", "adjustment", "carry", "cashOut", "closing"] as const;
const monthLabelKeys = [
  "leave.month.1", "leave.month.2", "leave.month.3", "leave.month.4", "leave.month.5", "leave.month.6",
  "leave.month.7", "leave.month.8", "leave.month.9", "leave.month.10", "leave.month.11", "leave.month.12",
] as const;

function TextField({ label, ...props }: React.ComponentProps<typeof Input> & { label: string }) {
  return <label className="grid gap-1.5 text-xs font-semibold text-[var(--text-muted)]"><span>{label}</span><Input {...props} /></label>;
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div className="grid gap-1.5 text-xs font-semibold text-[var(--text-muted)]"><span>{label}</span><JalaliDatePicker value={value} onChange={onChange} /></div>;
}

export function LeaveAccrualPanel({ data, setData, summary }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  summary: LeaveEntitlementSummary;
}) {
  const { b, duration, number } = useBusinessUi();
  const [policyHours, setPolicyHours] = useState(String(Math.floor(data.settings.monthlyLeaveMinutes / 60)));
  const [policyMinutes, setPolicyMinutes] = useState(String(data.settings.monthlyLeaveMinutes % 60));
  const [effectiveDate, setEffectiveDate] = useState(localDateKey());
  const [carryYear, setCarryYear] = useState(String(summary.year - 1));
  const [carryMinutes, setCarryMinutes] = useState("");
  const [carryNote, setCarryNote] = useState("");
  const [adjustmentMinutes, setAdjustmentMinutes] = useState("");
  const [adjustmentDate, setAdjustmentDate] = useState(localDateKey());
  const [adjustmentNote, setAdjustmentNote] = useState("");
  const [settlementYear, setSettlementYear] = useState(String(summary.year - 1));
  const [settlementCarry, setSettlementCarry] = useState("");
  const [settlementCashOut, setSettlementCashOut] = useState("");
  const [settlementNote, setSettlementNote] = useState("");
  const [feedback, setFeedback] = useState("");
  const events = [...data.settings.leaveEvents].sort((a, bEvent) => bEvent.createdAt.localeCompare(a.createdAt));
  const selectedSettlementYear = Number(settlementYear);
  const closing = Number.isInteger(selectedSettlementYear) ? calculateLeaveYearSummary(data, selectedSettlementYear, 12).available : 0;
  const settlementExists = Number.isInteger(selectedSettlementYear) && hasSettlementForYear(data.settings, selectedSettlementYear);
  const settlementTooEarly = selectedSettlementYear === summary.year && summary.currentMonth < 12;

  function savePolicy(event: React.SubmitEvent<HTMLElement>) {
    event.preventDefault();
    const hours = Number(policyHours);
    const minutes = Number(policyMinutes);
    if (!Number.isInteger(hours) || hours < 0 || !Number.isInteger(minutes) || minutes < 0 || minutes > 59) return;
    setData((current) => setMonthlyLeavePolicy(current, hours * 60 + minutes, effectiveDate));
    setFeedback("");
  }

  function saveCarry(event: React.SubmitEvent<HTMLElement>) {
    event.preventDefault();
    const result = appendLeaveCarryForward(data, Number(carryYear), Number(carryMinutes), carryNote);
    if (!result) { setFeedback(b("leave.history.duplicate")); return; }
    setData(result);
    setCarryMinutes("");
    setCarryNote("");
    setFeedback("");
  }

  function saveAdjustment(event: React.SubmitEvent<HTMLElement>) {
    event.preventDefault();
    const minutes = Number(adjustmentMinutes);
    if (!Number.isInteger(minutes) || minutes === 0) return;
    setData((current) => appendLeaveAdjustment(current, minutes, adjustmentDate, adjustmentNote));
    setAdjustmentMinutes("");
    setAdjustmentNote("");
    setFeedback("");
  }

  function saveSettlement(event: React.SubmitEvent<HTMLElement>) {
    event.preventDefault();
    const carried = Number(settlementCarry || 0);
    const cashOut = Number(settlementCashOut || 0);
    const result = settleLeaveYear(data, selectedSettlementYear, carried, cashOut, settlementNote);
    if (!result) { setFeedback(settlementExists ? b("leave.history.duplicate") : b("leave.history.invalid")); return; }
    setData(result);
    setSettlementCarry("");
    setSettlementCashOut("");
    setSettlementNote("");
    setFeedback("");
  }

  return (
    <section className="mb-6">
      <SectionHeading icon={<History />} eyebrow={b("leave.ledger.title")} title={b("leave.ledger.title")} description={b("leave.ledger.description")} />
      <SurfaceCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-start text-xs" aria-label={b("leave.ledger.title")}>
            <thead className="bg-[var(--surface-2)] text-[10px] text-[var(--text-muted)]"><tr>{ledgerColumns.map((column) => <th key={column} className="px-3 py-3 font-bold">{b(`leave.ledger.${column}`)}</th>)}</tr></thead>
            <tbody>{summary.monthlyBreakdown.map((month) => <tr key={month.month} className={month.future ? "opacity-50" : "border-t border-[var(--border)]"}>
              <th scope="row" className="px-3 py-3 font-semibold">{b(monthLabelKeys[month.month - 1]!)}{month.future && <small className="ms-2 text-[10px] text-[var(--text-muted)]">{b("leave.ledger.future")}</small>}</th>
              <td className="px-3 py-3 tabular-nums">{duration(month.accrued)}</td><td className="px-3 py-3 tabular-nums">{duration(month.used)}</td>
              <td className="px-3 py-3 tabular-nums">{month.adjustment ? `${month.adjustment > 0 ? "+" : "−"}${duration(Math.abs(month.adjustment))}` : "—"}</td>
              <td className="px-3 py-3 tabular-nums">{month.carryForward ? `${month.carryForward > 0 ? "+" : "−"}${duration(Math.abs(month.carryForward))}` : "—"}</td>
              <td className="px-3 py-3 tabular-nums">{month.cashOut ? duration(month.cashOut) : "—"}</td><td className="px-3 py-3 font-bold tabular-nums">{duration(month.closing)}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <p className="border-t border-[var(--border)] px-4 py-3 text-xs text-[var(--text-muted)]">{b("leave.ledger.policyMaximum")}: <strong className="text-[var(--text)]">{duration(summary.annualEntitlement)}</strong></p>
      </SurfaceCard>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <SurfaceCard as="form" data-leave-policy-form onSubmit={savePolicy} className="grid gap-3 p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold"><Settings2 className="size-4 text-[var(--accent-strong)]" />{b("leave.policy.title")}</h3>
          <div className="grid grid-cols-2 gap-3"><TextField label={b("leave.policy.hours")} data-leave-field="policy-hours" inputMode="numeric" pattern="[0-9]*" value={policyHours} onChange={(event) => setPolicyHours(event.target.value)} required /><TextField label={b("leave.policy.minutes")} data-leave-field="policy-minutes" inputMode="numeric" pattern="[0-9]*" value={policyMinutes} onChange={(event) => setPolicyMinutes(event.target.value)} required /></div>
          <DateField label={b("leave.policy.effectiveDate")} value={effectiveDate} onChange={setEffectiveDate} />
          <Button type="submit" size="sm"><Check />{b("leave.policy.save")}</Button>
        </SurfaceCard>

        <SurfaceCard as="form" data-leave-carry-form onSubmit={saveCarry} className="grid gap-3 p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold"><PlusCircle className="size-4 text-[var(--accent-strong)]" />{b("leave.carry.title")}</h3>
          <div className="grid grid-cols-2 gap-3"><TextField label={b("leave.carry.sourceYear")} data-leave-field="carry-year" inputMode="numeric" pattern="[0-9]*" value={carryYear} onChange={(event) => setCarryYear(event.target.value)} required /><TextField label={b("leave.carry.minutes")} data-leave-field="carry-minutes" inputMode="numeric" pattern="[0-9]*" value={carryMinutes} onChange={(event) => setCarryMinutes(event.target.value)} required /></div>
          <TextField label={b("leave.carry.note")} data-leave-field="carry-note" value={carryNote} onChange={(event) => setCarryNote(event.target.value)} />
          <Button type="submit" size="sm"><Check />{b("leave.carry.save")}</Button>
        </SurfaceCard>

        <SurfaceCard as="form" data-leave-adjustment-form onSubmit={saveAdjustment} className="grid gap-3 p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold"><MinusCircle className="size-4 text-[var(--warning)]" />{b("leave.adjustment.title")}</h3>
          <div className="grid grid-cols-2 gap-3"><TextField label={b("leave.adjustment.minutes")} data-leave-field="adjustment-minutes" inputMode="numeric" pattern="-?[0-9]*" value={adjustmentMinutes} onChange={(event) => setAdjustmentMinutes(event.target.value)} required /><DateField label={b("leave.adjustment.date")} value={adjustmentDate} onChange={setAdjustmentDate} /></div>
          <TextField label={b("leave.adjustment.note")} data-leave-field="adjustment-note" value={adjustmentNote} onChange={(event) => setAdjustmentNote(event.target.value)} required />
          <Button type="submit" size="sm"><Check />{b("leave.adjustment.save")}</Button>
        </SurfaceCard>

        <SurfaceCard as="form" data-leave-settlement-form onSubmit={saveSettlement} className="grid gap-3 p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold"><CircleDollarSign className="size-4 text-[var(--success)]" />{b("leave.settlement.title")}</h3>
          <TextField label={b("leave.settlement.year")} data-leave-field="settlement-year" inputMode="numeric" pattern="[0-9]*" value={settlementYear} onChange={(event) => setSettlementYear(event.target.value)} required />
          <div className="grid grid-cols-2 gap-3"><TextField label={b("leave.settlement.carry")} data-leave-field="settlement-carry" inputMode="numeric" pattern="[0-9]*" value={settlementCarry} onChange={(event) => setSettlementCarry(event.target.value)} /><TextField label={b("leave.settlement.cashOut")} data-leave-field="settlement-cash-out" inputMode="numeric" pattern="[0-9]*" value={settlementCashOut} onChange={(event) => setSettlementCashOut(event.target.value)} /></div>
          <TextField label={b("leave.settlement.note")} data-leave-field="settlement-note" value={settlementNote} onChange={(event) => setSettlementNote(event.target.value)} />
          <p className="text-xs text-[var(--text-muted)]">{number(Math.max(0, closing))} {b("leave.adjustment.minutes")}</p>
          <Button type="submit" size="sm" disabled={settlementExists || settlementTooEarly}><Check />{b("leave.settlement.save")}</Button>
        </SurfaceCard>
      </div>

      {feedback && <p role="status" className="mt-3 text-sm text-[var(--danger)]">{feedback}</p>}
      <div className="mt-5">
        <SectionHeading icon={<History />} eyebrow={b("leave.history.title")} title={b("leave.history.title")} />
        {events.length ? <SurfaceCard className="divide-y divide-[var(--border)] p-0">{events.map((event) => {
          const title = event.type === "adjustment" ? b("leave.history.adjustment") : event.type === "cash-out" ? b("leave.history.cashOut") : b("leave.history.carry");
          const amount = event.type === "adjustment" ? `${event.minutes > 0 ? "+" : "−"}${duration(Math.abs(event.minutes))}` : `${event.type === "cash-out" ? "−" : "+"}${duration(event.minutes)}`;
          const detail = event.type === "adjustment" ? event.date : event.type === "cash-out" ? `${event.jalaliYear}` : `${event.sourceYear} → ${event.destinationYear}`;
          return <div key={event.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"><div><strong className="block">{title}</strong><span className="text-xs text-[var(--text-muted)]">{detail}{event.note ? ` · ${event.note}` : ""}</span></div><strong className="font-bold tabular-nums">{amount}</strong></div>;
        })}</SurfaceCard> : <p className="text-sm text-[var(--text-muted)]">{b("leave.history.empty")}</p>}
      </div>
    </section>
  );
}
