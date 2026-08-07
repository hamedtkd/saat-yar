import { FilePlus2, ReceiptText } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { TableBody, TableHead, TableShell } from "@/components/common/table-shell";
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
  return <TableShell className="p-3 shadow-[0_8px_24px_rgba(0,0,0,.035)]"><TableHead><tr><th>شماره</th><th>مشتری</th><th>صدور / سررسید</th><th>مبلغ</th><th>وضعیت</th><th>عملیات</th></tr></TableHead><TableBody>
    {invoices.map((invoice) => <InvoiceRow key={invoice.id} invoice={invoice} clients={clients} financialsHidden={financialsHidden} onStatusChange={(status) => onStatusChange(invoice.id, status)} onRemove={() => onRemove(invoice.id)} />)}
    {invoices.length === 0 && <tr><td colSpan={6}><EmptyState icon={<ReceiptText />} title="هنوز فاکتوری نداری" description="فاکتور اول را بساز؛ مشتری و پروژه را هم می‌توانی داخل همان فرم ایجاد کنی."><Button onClick={onCreate}><FilePlus2 /> فاکتور جدید</Button></EmptyState></td></tr>}
  </TableBody></TableShell>;
}
