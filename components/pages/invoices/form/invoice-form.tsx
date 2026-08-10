"use client";

import { useState } from "react";
import { FilePlus2, FolderPlus, Users } from "lucide-react";
import { FieldError, FormFeedback } from "@/components/common/form-feedback";
import { NumberField } from "@/components/common/number-field";
import { useBusinessUi } from "@/components/i18n/use-business-ui";
import { JalaliDatePicker } from "@/components/pickers";
import { SectionHeading } from "@/components/common/section-heading";
import { SurfaceCard } from "@/components/common/surface-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { hasFormErrors, validateInvoiceDraft } from "@/lib/business-form-validation";
import type { Client, ClientDraft, Project, ProjectDraft } from "@/lib/types";
import { QuickClientDialog } from "@/components/pages/clients/quick-client-dialog";
import { QuickProjectDialog } from "@/components/pages/projects/quick-project-dialog";
import type { InvoiceDraft } from "../types";

export function InvoiceForm({ clients, projects, draft, setDraft, createClient, createProject, onSave, onCancel }: {
  clients: Client[];
  projects: Project[];
  draft: InvoiceDraft;
  setDraft: React.Dispatch<React.SetStateAction<InvoiceDraft>>;
  createClient: (draft: ClientDraft) => string | undefined;
  createProject: (draft: ProjectDraft) => string | undefined;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { b, locale } = useBusinessUi();
  const [submitted, setSubmitted] = useState(false);
  const activeClients = clients.filter((client) => !client.archived);
  const selectedClient = activeClients.find((client) => client.id === draft.clientId);
  const visibleProjects = projects.filter((project) => project.status === "active" && project.clientId === draft.clientId);
  const fieldClass = "grid gap-2 text-xs font-semibold text-[var(--text-muted)]";
  const errors = submitted ? validateInvoiceDraft(draft, locale) : {};
  const firstError = errors.clientId ?? errors.issuedAt ?? errors.dueAt ?? errors.description ?? errors.quantity ?? errors.unitPrice ?? errors.discount ?? errors.taxPercent;
  const selectClient = (clientId: string) => setDraft((value) => ({ ...value, clientId, projectId: "" }));
  const selectProject = (projectId: string) => setDraft((value) => ({ ...value, projectId }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateInvoiceDraft(draft, locale);
    setSubmitted(true);
    if (hasFormErrors(nextErrors)) return;
    onSave();
  };

  return (
    <SurfaceCard as="section" className="mb-5 p-5">
      <SectionHeading icon={<FilePlus2 />} eyebrow={b("invoices.form.eyebrow")} title={b("invoices.form.title")} description={b("invoices.form.description")} />
      <form onSubmit={submit} noValidate>
        <FormFeedback message={firstError} className="mb-4" />
        <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
          <div className={fieldClass}>
            <div className="flex items-center justify-between gap-2"><span>{b("common.client")}</span><QuickClientDialog compact onCreate={createClient} onCreated={selectClient} /></div>
            {activeClients.length ? (
              <Select value={draft.clientId} onValueChange={selectClient}>
                <SelectTrigger aria-invalid={Boolean(errors.clientId)}><SelectValue placeholder={b("projects.form.selectClient")} /></SelectTrigger>
                <SelectContent>{activeClients.map((client) => <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>)}</SelectContent>
              </Select>
            ) : (
              <div className="flex min-h-11 items-center gap-2 rounded-[var(--control-radius)] border border-dashed border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 text-[10px] text-[var(--text-muted)]">
                <Users aria-hidden="true" className="size-4 shrink-0" /><span>{b("invoices.form.noClients")}</span>
              </div>
            )}
            <FieldError message={errors.clientId} />
          </div>
          <div className={fieldClass}>
            <div className="flex items-center justify-between gap-2">
              <span>{b("common.project")}</span>
              {selectedClient && <QuickProjectDialog client={selectedClient} onCreate={createProject} onCreated={selectProject} label={b("invoices.form.newProject")} />}
            </div>
            {!draft.clientId ? (
              <div className="flex min-h-11 items-center gap-2 rounded-[var(--control-radius)] border border-dashed border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 text-[10px] text-[var(--text-muted)]">
                <FolderPlus aria-hidden="true" className="size-4 shrink-0" /><span>{b("invoices.form.projectNeedsClient")}</span>
              </div>
            ) : (
              <Select value={draft.projectId || "none"} onValueChange={(projectId) => selectProject(projectId === "none" ? "" : projectId)}>
                <SelectTrigger><SelectValue placeholder={b("invoices.form.noProject")} /></SelectTrigger>
                <SelectContent><SelectItem value="none">{b("invoices.form.noProject")}</SelectItem>{visibleProjects.map((project) => <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>)}</SelectContent>
              </Select>
            )}
          </div>
          <div className={fieldClass}><span>{b("invoices.form.issued")}</span><JalaliDatePicker value={draft.issuedAt} onChange={(issuedAt) => setDraft((value) => ({ ...value, issuedAt }))} placeholder={b("invoices.form.issued")} /><FieldError message={errors.issuedAt} /></div>
          <div className={fieldClass}><span>{b("invoices.form.due")}</span><JalaliDatePicker value={draft.dueAt} onChange={(dueAt) => setDraft((value) => ({ ...value, dueAt }))} placeholder={b("invoices.form.due")} /><FieldError message={errors.dueAt} /></div>
          <label className={`${fieldClass} col-span-2 max-[620px]:col-auto`}>{b("invoices.form.descriptionField")}<Input autoFocus aria-invalid={Boolean(errors.description)} value={draft.description} onChange={(event) => setDraft((value) => ({ ...value, description: event.target.value }))} /><FieldError message={errors.description} /></label>
          <label className={fieldClass}>{b("invoices.form.quantity")}<NumberField value={draft.quantity} onValueChange={(quantity) => setDraft((value) => ({ ...value, quantity }))} /><FieldError message={errors.quantity} /></label>
          <label className={fieldClass}>{b("invoices.form.unitPrice")}<NumberField value={draft.unitPrice} onValueChange={(unitPrice) => setDraft((value) => ({ ...value, unitPrice }))} /><FieldError message={errors.unitPrice} /></label>
          <label className={fieldClass}>{b("invoices.form.discount")}<NumberField value={draft.discount} onValueChange={(discount) => setDraft((value) => ({ ...value, discount }))} /><FieldError message={errors.discount} /></label>
          <label className={fieldClass}>{b("invoices.form.tax")}<NumberField value={draft.taxPercent} onValueChange={(taxPercent) => setDraft((value) => ({ ...value, taxPercent }))} /><FieldError message={errors.taxPercent} /></label>
          <label className={`${fieldClass} col-span-2 max-[620px]:col-auto`}>{b("common.note")}<Input value={draft.note} onChange={(event) => setDraft((value) => ({ ...value, note: event.target.value }))} /></label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2"><Button type="submit">{b("invoices.form.save")}</Button><Button type="button" variant="outline" onClick={onCancel}>{b("common.cancel")}</Button><span className="text-[10px] text-[var(--text-muted)]">{b("invoices.form.hint")}</span></div>
      </form>
    </SurfaceCard>
  );
}
