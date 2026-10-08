"use client";

import { useState } from "react";
import { Check, CircleDollarSign, History, MinusCircle, PlusCircle, Settings2 } from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";
import { SurfaceCard } from "@/components/common/surface-card";
import { useBusinessUi } from "@/components/i18n/use-business-ui";
import { JalaliDatePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  return <div className="grid gap-1.5 text-xs font-semibold text-[var(--text-muted)] [&_button[aria-haspopup=dialog]]:!h-[var(--control-height)] [&_button[aria-haspopup=dialog]]:!rounded-[var(--control-radius)]"><span>{label}</span><JalaliDatePicker value={value} onChange={onChange} /></div>;
}

export function LeaveAccrualPanel({ data, setData, summary }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  summary: LeaveEntitlementSummary;
}) {
  const { b, duration } = useBusinessUi();
  const [policyHours, setPolicyHours] = useState(String(Math.floor(data.settings.monthlyLeaveMinutes / 60)));
  const [policyMinutes, setPolicyMinutes] = useState(String(data.settings.monthlyLeaveMinutes % 60));
  const [effectiveDate, setEffectiveDate] = useState(localDateKey());
  const [carryYear, setCarryYear] = useState(String(summary.year - 1));
  const [carryMinutes, setCarryMinutes] = useState("");
  const [carryNote, setCarryNote] = useState("");
  const [adjustmentMinutes, setAdjustmentMinutes] = useState("");
  const [adjustmentDirection, setAdjustmentDirection] = useState<"increase" | "decrease">("increase");
  const [adjustmentDate, setAdjustmentDate] = useState(localDateKey());
  const [adjustmentNote, setAdjustmentNote] = useState("");
  const [settlementYear, setSettlementYear] = useState(String(summary.year - 1));
  const [settlementCarry, setSettlementCarry] = useState("");
  const [settlementCashOut, setSettlementCashOut] = useState("");
  const [settlementNote, setSettlementNote] = useState("");
  const [feedback, setFeedback] = useState("");
  const [manageOpen, setManageOpen] = useState(false);
  const [manageAction, setManageAction] = useState<"policy" | "carry" | "adjustment" | "settlement" | null>(null);
  const [settlementConfirm, setSettlementConfirm] = useState(false);
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
    const amount = Number(adjustmentMinutes);
    if (!Number.isInteger(amount) || amount <= 0) return;
    const minutes = amount * (adjustmentDirection === "decrease" ? -1 : 1);
    setData((current) => appendLeaveAdjustment(current, minutes, adjustmentDate, adjustmentNote));
    setAdjustmentMinutes("");
    setAdjustmentNote("");
    setFeedback("");
  }

  function saveSettlement(event: React.SubmitEvent<HTMLElement>) {
    event.preventDefault();
    const carried = Number(settlementCarry || 0);
    const cashOut = Number(settlementCashOut || 0);
    if (!settlementConfirm) { setSettlementConfirm(true); return; }
    const result = settleLeaveYear(data, selectedSettlementYear, carried, cashOut, settlementNote);
    if (!result) { setFeedback(settlementExists ? b("leave.history.duplicate") : b("leave.history.invalid")); return; }
    setData(result);
    setSettlementCarry("");
    setSettlementCashOut("");
    setSettlementNote("");
    setSettlementConfirm(false);
    setFeedback("");
  }

  return (
    <section className="mb-6">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <SectionHeading icon={<History />} eyebrow={b("leave.ledger.title")} title={b("leave.ledger.title")} description={b("leave.ledger.description")} />
        <Button variant="outline" onClick={() => { setManageAction(null); setManageOpen(true); }}><Settings2 aria-hidden="true" />{b("leave.manage.open")}</Button>
      </div>
      <div className="mb-3 flex flex-wrap gap-x-6 gap-y-2 rounded-[var(--card-radius)] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-xs">
        <span>{b("leave.metrics.monthly")}: <strong>{duration(summary.monthlyEntitlement)} {b("common.hour")}</strong></span>
        <span>{b("leave.metrics.annual")}: <strong>{duration(summary.annualEntitlement)} {b("common.hour")}</strong></span>
        <span>{b("leave.metrics.adjustments")}: <strong>{summary.adjustments > 0 ? "+" : summary.adjustments < 0 ? "−" : ""}{duration(Math.abs(summary.adjustments))} {b("common.hour")}</strong></span>
      </div>
      <SurfaceCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-start text-xs" aria-label={b("leave.ledger.title")}>
            <thead className="bg-[var(--surface-2)] text-[10px] text-[var(--text-muted)]"><tr>{ledgerColumns.filter((column) => column !== "carry" && column !== "cashOut").map((column) => <th key={column} className="px-3 py-2 font-bold">{b(`leave.ledger.${column}`)}</th>)}</tr></thead>
            <tbody>{summary.monthlyBreakdown.map((month) => <tr key={month.month} className={`${month.future ? "text-[var(--text-muted)] opacity-55" : "border-t border-[var(--border)]"} ${month.month === summary.currentMonth ? "bg-[var(--accent-soft)]" : ""}`}>
              <th scope="row" className="px-3 py-2 font-semibold">{b(monthLabelKeys[month.month - 1]!)}{month.future && <small className="ms-2 text-[10px]">{b("leave.ledger.future")}</small>}</th>
              <td className="px-3 py-2 tabular-nums">{duration(month.accrued)}</td><td className="px-3 py-2 tabular-nums">{duration(month.used)}</td>
              <td className="px-3 py-2 tabular-nums">{month.adjustment ? `${month.adjustment > 0 ? "+" : "−"}${duration(Math.abs(month.adjustment))}` : "—"}</td>
              <td className="px-3 py-2 font-bold tabular-nums">{duration(month.closing)}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </SurfaceCard>

      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{b("leave.manage.title")}</DialogTitle><DialogDescription>{b("leave.manage.description")}</DialogDescription></DialogHeader>
          {!manageAction ? <div className="grid gap-2" data-leave-manage-actions>
            {(["policy", "carry", "adjustment", "settlement"] as const).map((action) => <Button key={action} variant="outline" className="justify-start" onClick={() => { setManageAction(action); setFeedback(""); setSettlementConfirm(false); }}>
              {action === "policy" ? <Settings2 /> : action === "carry" ? <PlusCircle /> : action === "adjustment" ? <MinusCircle /> : <CircleDollarSign />}
              {b(`leave.manage.${action}`)}
            </Button>)}
          </div> : <div className="grid gap-3">
            <Button variant="ghost" size="sm" className="justify-self-start" onClick={() => { setManageAction(null); setSettlementConfirm(false); }}>{b("leave.manage.back")}</Button>
      {manageAction === "policy" && <SurfaceCard as="form" data-leave-policy-form onSubmit={savePolicy} className="grid gap-3 p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold"><Settings2 className="size-4 text-[var(--accent-strong)]" />{b("leave.policy.title")}</h3>
          <div className="grid grid-cols-2 gap-3"><TextField label={b("leave.policy.hours")} data-leave-field="policy-hours" inputMode="numeric" pattern="[0-9]*" value={policyHours} onChange={(event) => setPolicyHours(event.target.value)} required /><TextField label={b("leave.policy.minutes")} data-leave-field="policy-minutes" inputMode="numeric" pattern="[0-9]*" value={policyMinutes} onChange={(event) => setPolicyMinutes(event.target.value)} required /></div>
          <DateField label={b("leave.policy.effectiveDate")} value={effectiveDate} onChange={setEffectiveDate} />
          <Button type="submit"><Check />{b("leave.policy.save")}</Button>
        </SurfaceCard>}

      {manageAction === "carry" && <SurfaceCard as="form" data-leave-carry-form onSubmit={saveCarry} className="grid gap-3 p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold"><PlusCircle className="size-4 text-[var(--accent-strong)]" />{b("leave.carry.title")}</h3>
          <p className="text-xs text-[var(--text-muted)]">{b("leave.carry.hint")}</p>
          <div className="grid grid-cols-2 gap-3"><TextField label={b("leave.carry.sourceYear")} data-leave-field="carry-year" inputMode="numeric" pattern="[0-9]*" value={carryYear} onChange={(event) => setCarryYear(event.target.value)} required /><TextField label={b("leave.carry.minutes")} data-leave-field="carry-minutes" inputMode="numeric" pattern="[0-9]*" value={carryMinutes} onChange={(event) => setCarryMinutes(event.target.value)} required /></div>
          <TextField label={b("leave.carry.note")} data-leave-field="carry-note" value={carryNote} onChange={(event) => setCarryNote(event.target.value)} />
          <Button type="submit"><Check />{b("leave.carry.save")}</Button>
        </SurfaceCard>}

      {manageAction === "adjustment" && <SurfaceCard as="form" data-leave-adjustment-form onSubmit={saveAdjustment} className="grid gap-3 p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold"><MinusCircle className="size-4 text-[var(--warning)]" />{b("leave.adjustment.title")}</h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-xs font-semibold text-[var(--text-muted)]"><span>{b("leave.adjustment.direction")}</span><Select value={adjustmentDirection} onValueChange={(value) => setAdjustmentDirection(value as "increase" | "decrease")}><SelectTrigger className="h-[var(--control-height)] rounded-[var(--control-radius)]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="increase">{b("leave.adjustment.increase")}</SelectItem><SelectItem value="decrease">{b("leave.adjustment.decrease")}</SelectItem></SelectContent></Select></label>
            <TextField label={b("leave.adjustment.minutes")} data-leave-field="adjustment-minutes" inputMode="numeric" pattern="[0-9]*" value={adjustmentMinutes} onChange={(event) => setAdjustmentMinutes(event.target.value)} required />
            <DateField label={b("leave.adjustment.date")} value={adjustmentDate} onChange={setAdjustmentDate} />
          </div>
          <TextField label={b("leave.adjustment.note")} data-leave-field="adjustment-note" value={adjustmentNote} onChange={(event) => setAdjustmentNote(event.target.value)} required />
          <Button type="submit"><Check />{b("leave.adjustment.save")}</Button>
        </SurfaceCard>}

      {manageAction === "settlement" && <SurfaceCard as="form" data-leave-settlement-form onSubmit={saveSettlement} className="grid gap-3 p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold"><CircleDollarSign className="size-4 text-[var(--success)]" />{b("leave.settlement.title")}</h3>
          <TextField label={b("leave.settlement.year")} data-leave-field="settlement-year" inputMode="numeric" pattern="[0-9]*" value={settlementYear} onChange={(event) => { setSettlementYear(event.target.value); setSettlementConfirm(false); }} required />
          <div className="grid grid-cols-2 gap-3"><TextField label={b("leave.settlement.carry")} data-leave-field="settlement-carry" inputMode="numeric" pattern="[0-9]*" value={settlementCarry} onChange={(event) => { setSettlementCarry(event.target.value); setSettlementConfirm(false); }} /><TextField label={b("leave.settlement.cashOut")} data-leave-field="settlement-cash-out" inputMode="numeric" pattern="[0-9]*" value={settlementCashOut} onChange={(event) => { setSettlementCashOut(event.target.value); setSettlementConfirm(false); }} /></div>
          <TextField label={b("leave.settlement.note")} data-leave-field="settlement-note" value={settlementNote} onChange={(event) => setSettlementNote(event.target.value)} />
          <div className="grid grid-cols-2 gap-2 rounded-[var(--control-radius)] bg-[var(--surface-2)] p-3 text-xs"><span>{b("leave.settlement.closing")}</span><strong>{duration(closing)}</strong><span>{b("leave.settlement.unallocated")}</span><strong>{duration(closing - Number(settlementCarry || 0) - Number(settlementCashOut || 0))}</strong></div>
          {settlementConfirm && <p role="alert" className="rounded-[var(--control-radius)] bg-[var(--warning-soft)] p-3 text-xs text-[var(--warning)]">{b("leave.settlement.confirm")}</p>}
          <Button type="submit" disabled={settlementExists || settlementTooEarly || closing - Number(settlementCarry || 0) - Number(settlementCashOut || 0) !== 0}>{settlementConfirm ? b("leave.settlement.confirmAction") : b("leave.settlement.review")}<Check /></Button>
        </SurfaceCard>}
          </div>}
          {feedback && <p role="status" className="text-sm text-[var(--danger)]">{feedback}</p>}
        </DialogContent>
      </Dialog>

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
