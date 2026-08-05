import { Printer, Trash2 } from "lucide-react";
import { PrivateMoney } from "@/components/common/private-money";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { jalali, localDateKey } from "@/lib/format";
import { getEffectiveInvoiceStatus, getInvoiceTotals } from "@/lib/invoices";
import type { Client, Invoice, InvoiceStatus } from "@/lib/types";
import { statusLabels } from "../types";

export function InvoiceRow({ invoice, clients, financialsHidden, onStatusChange, onRemove }: {
  invoice: Invoice;
  clients: Client[];
  financialsHidden: boolean;
  onStatusChange: (status: InvoiceStatus) => void;
  onRemove: () => void;
}) {
  const totals = getInvoiceTotals(invoice);
  const status = getEffectiveInvoiceStatus(invoice, localDateKey());
  return (
    <tr className="border-b">
      <td className="p-3 font-bold">{invoice.number}</td>
      <td className="p-3">{clients.find((client) => client.id === invoice.clientId)?.name ?? "—"}</td>
      <td className="p-3">{jalali(invoice.issuedAt)}<small className="block text-[#6c7d89]">{invoice.dueAt ? `سررسید ${jalali(invoice.dueAt)}` : "بدون سررسید"}</small></td>
      <td className="p-3 font-bold"><PrivateMoney value={totals.total} hidden={financialsHidden} /> تومان</td>
      <td className="p-3"><Select value={status} onValueChange={(value) => onStatusChange(value as InvoiceStatus)}><SelectTrigger className="min-w-32"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></td>
      <td className="p-3"><div className="flex gap-1"><Button size="icon" variant="ghost" aria-label="چاپ فاکتور" onClick={() => window.print()}><Printer /></Button><Button size="icon" variant="ghost" aria-label="حذف فاکتور" onClick={onRemove}><Trash2 /></Button></div></td>
    </tr>
  );
}
