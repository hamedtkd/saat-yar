import { ReceiptText } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { SurfaceCard } from "@/components/common/surface-card";
import type { Client, Invoice, InvoiceStatus } from "@/lib/types";
import { InvoiceRow } from "./invoice-row";

export function InvoicesTable({ invoices, clients, financialsHidden, onStatusChange, onRemove }: {
  invoices: Invoice[];
  clients: Client[];
  financialsHidden: boolean;
  onStatusChange: (id: string, status: InvoiceStatus) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <SurfaceCard as="section" className="p-3">
      <div className="overflow-x-auto"><table className="w-full border-collapse text-xs"><thead><tr className="border-b bg-[#fbfcfc] text-right"><th className="p-3">شماره</th><th className="p-3">مشتری</th><th className="p-3">صدور / سررسید</th><th className="p-3">مبلغ</th><th className="p-3">وضعیت</th><th className="p-3">عملیات</th></tr></thead><tbody>
        {invoices.map((invoice) => <InvoiceRow key={invoice.id} invoice={invoice} clients={clients} financialsHidden={financialsHidden} onStatusChange={(status) => onStatusChange(invoice.id, status)} onRemove={() => onRemove(invoice.id)} />)}
        {invoices.length === 0 && <tr><td colSpan={6}><EmptyState compact icon={<ReceiptText />} description="هنوز فاکتوری ثبت نشده است." /></td></tr>}
      </tbody></table></div>
    </SurfaceCard>
  );
}
