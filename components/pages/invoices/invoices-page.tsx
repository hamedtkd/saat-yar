"use client";

import { FilePlus2 } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { Button } from "@/components/ui/button";
import type { AppData } from "@/lib/types";
import { InvoiceForm } from "./form/invoice-form";
import { InvoicesTable } from "./table/invoices-table";
import { useInvoices } from "./use-invoices";

export function InvoicesPage({ data, setData, financialsHidden }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  financialsHidden: boolean;
}) {
  const invoices = useInvoices(data, setData);
  return <>
    <PageHeading title="فاکتورها" description="فاکتور بساز، سررسیدها را پیگیری کن و نسخه قابل چاپ تحویل بده."><Button onClick={() => invoices.setShowForm(!invoices.showForm)}><FilePlus2 /> فاکتور جدید</Button></PageHeading>
    {invoices.showForm && <InvoiceForm clients={data.clients} projects={data.projects} draft={invoices.draft} setDraft={invoices.setDraft} onSave={invoices.addInvoice} onCancel={() => invoices.setShowForm(false)} />}
    <InvoicesTable invoices={invoices.invoices} clients={data.clients} financialsHidden={financialsHidden} onStatusChange={invoices.updateStatus} onRemove={invoices.removeInvoice} />
  </>;
}
