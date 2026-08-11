"use client";

import { FilePlus2, ReceiptText } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { SectionHeading } from "@/components/common/section-heading";
import { useBusinessUi } from "@/components/i18n/use-business-ui";
import { Button } from "@/components/ui/button";
import type { AppData, ClientDraft, ProjectDraft } from "@/lib/types";
import { InvoiceForm } from "./form/invoice-form";
import { InvoicesTable } from "./table/invoices-table";
import { useInvoices } from "./use-invoices";

export function InvoicesPage({ data, setData, financialsHidden, createClient, createProject }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  financialsHidden: boolean;
  createClient: (draft: ClientDraft) => string | undefined;
  createProject: (draft: ProjectDraft) => string | undefined;
}) {
  const { b } = useBusinessUi();
  const invoices = useInvoices(data, setData);

  return (
    <>
      <PageHeading title={b("invoices.title")} description={b("invoices.description")}>
        <Button onClick={() => invoices.setShowForm(!invoices.showForm)}><FilePlus2 /> {b("invoices.new")}</Button>
      </PageHeading>
      {invoices.showForm && (
        <InvoiceForm
          clients={data.clients}
          projects={data.projects}
          draft={invoices.draft}
          setDraft={invoices.setDraft}
          createClient={createClient}
          createProject={createProject}
          onSave={invoices.addInvoice}
          onCancel={() => invoices.setShowForm(false)}
        />
      )}
      <SectionHeading icon={<ReceiptText />} eyebrow={b("invoices.section.eyebrow")} title={b("invoices.section.title")} description={b("invoices.section.description")} />
      <InvoicesTable invoices={invoices.invoices} clients={data.clients} financialsHidden={financialsHidden} onStatusChange={invoices.updateStatus} onRemove={invoices.removeInvoice} onCreate={() => invoices.setShowForm(true)} />
    </>
  );
}
