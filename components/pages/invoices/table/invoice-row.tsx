"use client";

import { Printer, Trash2 } from "lucide-react";
import { PrivateMoney } from "@/components/common/private-money";
import { StatusBadge } from "@/components/common/status-badge";
import { useBusinessUi } from "@/components/i18n/use-business-ui";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { localDateKey } from "@/lib/format";
import { getEffectiveInvoiceStatus, getInvoiceTotals } from "@/lib/invoices";
import type { Client, Invoice, InvoiceStatus } from "@/lib/types";
import { statusMessageKeys } from "../types";

export function InvoiceRow({ invoice, clients, financialsHidden, onStatusChange, onRemove }: { invoice: Invoice; clients: Client[]; financialsHidden: boolean; onStatusChange: (status: InvoiceStatus) => void; onRemove: () => void }) {
  const { b, date } = useBusinessUi();
  const totals = getInvoiceTotals(invoice);
  const status = getEffectiveInvoiceStatus(invoice, localDateKey());
  return <tr><td className="font-bold text-[var(--text)]">{invoice.number}</td><td>{clients.find((client) => client.id === invoice.clientId)?.name ?? "—"}</td><td>{date(invoice.issuedAt)}<small className="block text-[var(--text-muted)]">{invoice.dueAt ? b("invoices.table.duePrefix", { date: date(invoice.dueAt) }) : b("invoices.table.noDue")}</small></td><td className="font-bold"><PrivateMoney value={totals.total} hidden={financialsHidden} /> {b("common.toman")}</td><td><div className="grid min-w-36 gap-2"><StatusBadge success={status === "paid"}>{b(statusMessageKeys[status])}</StatusBadge><Select value={status} onValueChange={(value) => onStatusChange(value as InvoiceStatus)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statusMessageKeys).map(([value, messageKey]) => <SelectItem key={value} value={value}>{b(messageKey)}</SelectItem>)}</SelectContent></Select></div></td><td><div className="flex gap-1"><Button size="icon" variant="ghost" aria-label={b("invoices.printAria")} onClick={() => window.print()}><Printer /></Button><Button size="icon" variant="destructive" aria-label={b("invoices.deleteAria")} onClick={onRemove}><Trash2 /></Button></div></td></tr>;
}
