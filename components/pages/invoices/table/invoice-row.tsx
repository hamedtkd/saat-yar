import { Printer, Trash2 } from "lucide-react";
import { PrivateMoney } from "@/components/common/private-money";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { jalali, localDateKey } from "@/lib/format";
import { getEffectiveInvoiceStatus, getInvoiceTotals } from "@/lib/invoices";
import type { Client, Invoice, InvoiceStatus } from "@/lib/types";
import { statusLabels } from "../types";

export function InvoiceRow({ invoice, clients, financialsHidden, onStatusChange, onRemove }: { invoice: Invoice; clients: Client[]; financialsHidden: boolean; onStatusChange: (status: InvoiceStatus) => void; onRemove: () => void }) {
  const totals = getInvoiceTotals(invoice);
  const status = getEffectiveInvoiceStatus(invoice, localDateKey());
  return <tr><td className="font-bold text-[var(--text)]">{invoice.number}</td><td>{clients.find((client) => client.id === invoice.clientId)?.name ?? "—"}</td><td>{jalali(invoice.issuedAt)}<small className="block text-[var(--text-muted)]">{invoice.dueAt ? `سررسید ${jalali(invoice.dueAt)}` : "بدون سررسید"}</small></td><td className="font-bold"><PrivateMoney value={totals.total} hidden={financialsHidden} /> تومان</td><td><div className="grid min-w-36 gap-2"><StatusBadge success={status === "paid"}>{statusLabels[status]}</StatusBadge><Select value={status} onValueChange={(value) => onStatusChange(value as InvoiceStatus)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div></td><td><div className="flex gap-1"><Button size="icon" variant="ghost" aria-label="چاپ فاکتور" onClick={() => window.print()}><Printer /></Button><Button size="icon" variant="destructive" aria-label="حذف فاکتور" onClick={onRemove}><Trash2 /></Button></div></td></tr>;
}
