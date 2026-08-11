"use client";

import { useSystemUi } from "@/components/i18n/use-system-ui";
import { PrivateMoney } from "@/components/common/private-money";
import type { PayrollBreakdownLine } from "@/lib/payroll-policy";
import type { SystemMessageKey } from "@/lib/i18n/system";
import type { ReturnTypeOfPayrollPreview } from "./payroll-policy-types";

const breakdownLabels: Record<PayrollBreakdownLine["key"], SystemMessageKey> = { base: "Base pay", overtime: "Overtime", holiday: "Holiday work", earning: "Benefits", deficit: "Deficit", deduction: "Deductions" };

export function PayrollPolicyPreview({ preview, hidden }: { preview: ReturnTypeOfPayrollPreview; hidden: boolean }) {
  const { duration, number, s } = useSystemUi();
  return (
    <aside className="grid gap-3 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><strong className="text-xs text-[var(--text)]">{s("Live payroll preview")}</strong><p className="mt-1 text-[9px] text-[var(--text-muted)]">{preview.source === "current-month" ? s("Based on {count} records from the current month", { count: number(preview.recordCount) }) : s("Sample data; current-month data replaces it after you record work.")}</p></div><span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[10px] font-black text-[var(--accent-strong)]">{s("Net: {amount} Toman", { amount: hidden ? "••••••" : number(preview.payroll.net) })}</span></div>
      <div className="grid grid-cols-4 gap-2 max-[900px]:grid-cols-2"><Mini label={s("Worked")} value={duration(preview.facts.workedMinutes)} /><Mini label={s("Target")} value={duration(preview.facts.targetMinutes)} /><Mini label={s("Overtime")} value={duration(preview.facts.overtimeMinutes)} /><Mini label={s("Holiday")} value={duration(preview.facts.holidayMinutes)} /></div>
      <div className="grid gap-1 border-t border-[var(--border)] pt-3">{preview.payroll.breakdown.filter((line) => line.amount > 0).map((line) => <div key={line.key} className="flex items-center justify-between text-[10px]"><span className="text-[var(--text-muted)]">{line.direction === "deduction" ? "−" : "+"} {s(breakdownLabels[line.key])}</span><strong className={line.direction === "deduction" ? "text-[var(--danger)]" : "text-[var(--text)]"}><PrivateMoney value={line.amount} hidden={hidden} /> {s("Toman")}</strong></div>)}</div>
    </aside>
  );
}

function Mini({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-2.5"><small className="block text-[9px] text-[var(--text-muted)]">{label}</small><strong className="mt-1 block text-xs text-[var(--text)]">{value}</strong></div>; }
