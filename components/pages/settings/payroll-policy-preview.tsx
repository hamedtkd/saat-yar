import { PrivateMoney } from "@/components/common/private-money";
import { duration } from "@/lib/format";
import type { ReturnTypeOfPayrollPreview } from "./payroll-policy-types";

export function PayrollPolicyPreview({ preview, hidden }: { preview: ReturnTypeOfPayrollPreview; hidden: boolean }) {
  return (
    <aside className="grid gap-3 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><strong className="text-xs text-[var(--text)]">پیش‌نمایش زنده حقوق</strong><p className="mt-1 text-[9px] text-[var(--text-muted)]">{preview.source === "current-month" ? `بر اساس ${preview.recordCount} رکورد ماه جاری` : "نمونه فرضی؛ بعد از ثبت کارکرد، داده ماه جاری جایگزین می‌شود."}</p></div><span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[10px] font-black text-[var(--accent-strong)]">خالص: <PrivateMoney value={preview.payroll.net} hidden={hidden} /> تومان</span></div>
      <div className="grid grid-cols-4 gap-2 max-[900px]:grid-cols-2"><Mini label="کارکرد" value={duration(preview.facts.workedMinutes)} /><Mini label="موظفی" value={duration(preview.facts.targetMinutes)} /><Mini label="اضافه" value={duration(preview.facts.overtimeMinutes)} /><Mini label="تعطیل" value={duration(preview.facts.holidayMinutes)} /></div>
      <div className="grid gap-1 border-t border-[var(--border)] pt-3">{preview.payroll.breakdown.filter((line) => line.amount > 0).map((line) => <div key={line.key} className="flex items-center justify-between text-[10px]"><span className="text-[var(--text-muted)]">{line.direction === "deduction" ? "−" : "+"} {line.title}</span><strong className={line.direction === "deduction" ? "text-[var(--danger)]" : "text-[var(--text)]"}><PrivateMoney value={line.amount} hidden={hidden} /> تومان</strong></div>)}</div>
    </aside>
  );
}

function Mini({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-2.5"><small className="block text-[9px] text-[var(--text-muted)]">{label}</small><strong className="mt-1 block text-xs text-[var(--text)]">{value}</strong></div>; }
