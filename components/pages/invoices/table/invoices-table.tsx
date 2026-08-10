"use client";

import { FilePlus2, ReceiptText } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { TableBody, TableHead, TableShell } from "@/components/common/table-shell";
import { useBusinessUi } from "@/components/i18n/use-business-ui";
import { Button } from "@/components/ui/button";
import type { Client, Invoice, InvoiceStatus } from "@/lib/types";
import { InvoiceRow } from "./invoice-row";

export function InvoicesTable({ invoices, clients, financialsHidden, onStatusChange, onRemove, onCreate }: {
  invoices: Invoice[];
  clients: Client[];
  financialsHidden: boolean;
  onStatusChange: (id: string, status: InvoiceStatus) => void;
  onRemove: (id: string) => void;
  onCreate: () => void;
}) {
  const { b } = useBusinessUi();
  return <TableShell className="p-3 shadow-[0_8px_24px_rgba(0,0,0,.035)]"><TableHead><tr><th>{b("invoices.table.number")}</th><th>{b("common.client")}</th><th>{b("invoices.table.issuedDue")}</th><th>{b("common.amount")}</th><th>{b("common.status")}</th><th>{b("common.actions")}</th></tr></TableHead><TableBody>
    {invoices.map((invoice) => <InvoiceRow key={invoice.id} invoice={invoice} clients={clients} financialsHidden={financialsHidden} onStatusChange={(status) => onStatusChange(invoice.id, status)} onRemove={() => onRemove(invoice.id)} />)}
    {invoices.length === 0 && <tr><td colSpan={6}><EmptyState icon={<ReceiptText />} title={b("invoices.empty.title")} description={b("invoices.empty.description")}><Button onClick={onCreate}><FilePlus2 /> {b("invoices.new")}</Button></EmptyState></td></tr>}
  </TableBody></TableShell>;
}
