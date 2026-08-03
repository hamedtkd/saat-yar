"use client";

import { useMemo, useState } from "react";
import { FilePlus2, Printer, ReceiptText, Trash2 } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberField } from "@/components/common/number-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { localDateKey, money, jalali } from "@/lib/format";
import { getEffectiveInvoiceStatus, getInvoiceTotals, nextInvoiceNumber } from "@/lib/invoices";
import type { AppData, Invoice, InvoiceStatus } from "@/lib/types";

const statusLabels: Record<InvoiceStatus, string> = { draft: "پیش‌نویس", sent: "ارسال‌شده", paid: "پرداخت‌شده", overdue: "سررسیدگذشته", cancelled: "لغوشده" };

export function InvoicesPage({ data, setData, financialsHidden }: { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; financialsHidden: boolean }) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ clientId: "", projectId: "", issuedAt: localDateKey(), dueAt: "", description: "خدمات پروژه", quantity: 1, unitPrice: 0, discount: 0, taxPercent: 0, note: "" });
  const invoices = useMemo(() => [...data.invoices].sort((a,b) => b.issuedAt.localeCompare(a.issuedAt)), [data.invoices]);
  const mask = (value: number) => financialsHidden ? "••••••" : money(value);

  function addInvoice() {
    if (!draft.clientId || !draft.description.trim() || draft.quantity <= 0 || draft.unitPrice < 0) return;
    const invoice: Invoice = {
      id: crypto.randomUUID(), number: nextInvoiceNumber(data.invoices, draft.issuedAt.slice(0,4)), clientId: draft.clientId,
      projectId: draft.projectId || undefined, issuedAt: draft.issuedAt, dueAt: draft.dueAt || undefined, status: "draft",
      lines: [{ id: crypto.randomUUID(), description: draft.description.trim(), quantity: draft.quantity, unitPrice: draft.unitPrice }],
      discount: draft.discount, taxPercent: draft.taxPercent, note: draft.note.trim(), createdAt: new Date().toISOString(),
    };
    setData((previous) => ({ ...previous, invoices: [invoice, ...previous.invoices] }));
    setShowForm(false);
  }

  function updateStatus(id: string, status: InvoiceStatus) {
    setData((previous) => ({ ...previous, invoices: previous.invoices.map((invoice) => invoice.id === id ? { ...invoice, status, paidAt: status === "paid" ? new Date().toISOString() : invoice.paidAt } : invoice) }));
  }

  return <>
    <PageHeading title="فاکتورها" description="فاکتور بساز، سررسیدها را پیگیری کن و نسخه قابل چاپ تحویل بده."><Button onClick={() => setShowForm((v) => !v)}><FilePlus2 /> فاکتور جدید</Button></PageHeading>
    {showForm && <section className="mb-5 rounded-2xl border border-[#dfe7e9] bg-white p-4 shadow-sm">
      <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
        <label>مشتری<Select value={draft.clientId} onValueChange={(clientId) => setDraft((v) => ({ ...v, clientId, projectId: "" }))}><SelectTrigger><SelectValue placeholder="انتخاب مشتری" /></SelectTrigger><SelectContent>{data.clients.filter(c => !c.archived).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></label>
        <label>پروژه<Select value={draft.projectId || "none"} onValueChange={(projectId) => setDraft((v) => ({ ...v, projectId: projectId === "none" ? "" : projectId }))}><SelectTrigger><SelectValue placeholder="بدون پروژه" /></SelectTrigger><SelectContent><SelectItem value="none">بدون پروژه</SelectItem>{data.projects.filter(p => !draft.clientId || p.clientId === draft.clientId).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></label>
        <label>تاریخ صدور<Input type="date" value={draft.issuedAt} onChange={(e) => setDraft(v => ({...v, issuedAt:e.target.value}))} /></label>
        <label>تاریخ سررسید<Input type="date" value={draft.dueAt} onChange={(e) => setDraft(v => ({...v, dueAt:e.target.value}))} /></label>
        <label className="col-span-2 max-[620px]:col-auto">شرح<Input value={draft.description} onChange={(e) => setDraft(v => ({...v, description:e.target.value}))} /></label>
        <label>تعداد<NumberField value={draft.quantity} onValueChange={(quantity) => setDraft(v => ({...v, quantity}))} /></label>
        <label>مبلغ واحد<NumberField value={draft.unitPrice} onValueChange={(unitPrice) => setDraft(v => ({...v, unitPrice}))} /></label>
        <label>تخفیف<NumberField value={draft.discount} onValueChange={(discount) => setDraft(v => ({...v, discount}))} /></label>
        <label>مالیات (درصد)<NumberField value={draft.taxPercent} onValueChange={(taxPercent) => setDraft(v => ({...v, taxPercent}))} /></label>
        <label className="col-span-2 max-[620px]:col-auto">یادداشت<Input value={draft.note} onChange={(e) => setDraft(v => ({...v, note:e.target.value}))} /></label>
      </div><div className="mt-4 flex gap-2"><Button onClick={addInvoice}>ذخیره فاکتور</Button><Button variant="outline" onClick={() => setShowForm(false)}>لغو</Button></div>
    </section>}
    <section className="rounded-2xl border border-[#dfe7e9] bg-white p-3 shadow-sm"><div className="overflow-x-auto"><table className="w-full border-collapse text-xs"><thead><tr className="border-b bg-[#fbfcfc] text-right"><th className="p-3">شماره</th><th className="p-3">مشتری</th><th className="p-3">صدور / سررسید</th><th className="p-3">مبلغ</th><th className="p-3">وضعیت</th><th className="p-3">عملیات</th></tr></thead><tbody>
      {invoices.map((invoice) => { const totals = getInvoiceTotals(invoice); const status = getEffectiveInvoiceStatus(invoice, localDateKey()); return <tr key={invoice.id} className="border-b"><td className="p-3 font-bold">{invoice.number}</td><td className="p-3">{data.clients.find(c=>c.id===invoice.clientId)?.name ?? "—"}</td><td className="p-3">{jalali(invoice.issuedAt)}<small className="block text-[#6c7d89]">{invoice.dueAt ? `سررسید ${jalali(invoice.dueAt)}` : "بدون سررسید"}</small></td><td className="p-3 font-bold">{mask(totals.total)} تومان</td><td className="p-3"><Select value={status} onValueChange={(value) => updateStatus(invoice.id, value as InvoiceStatus)}><SelectTrigger className="min-w-32"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statusLabels).map(([value,label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></td><td className="p-3"><div className="flex gap-1"><Button size="icon" variant="ghost" aria-label="چاپ فاکتور" onClick={() => window.print()}><Printer /></Button><Button size="icon" variant="ghost" aria-label="حذف فاکتور" onClick={() => setData(prev => ({...prev, invoices: prev.invoices.filter(i=>i.id!==invoice.id)}))}><Trash2 /></Button></div></td></tr> })}
      {invoices.length === 0 && <tr><td colSpan={6}><EmptyState compact icon={<ReceiptText />} description="هنوز فاکتوری ثبت نشده است." /></td></tr>}
    </tbody></table></div></section>
  </>;
}
