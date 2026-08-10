"use client";

import { useState } from "react";
import { FolderPlus, Save, Users } from "lucide-react";
import { FieldError, FormFeedback } from "@/components/common/form-feedback";
import { NumberField } from "@/components/common/number-field";
import { SectionHeading } from "@/components/common/section-heading";
import { SurfaceCard } from "@/components/common/surface-card";
import { useBusinessUi } from "@/components/i18n/use-business-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { hasFormErrors, validateProjectDraft } from "@/lib/business-form-validation";
import type { AppData, ClientDraft, ProjectDraft } from "@/lib/types";
import { QuickClientDialog } from "../clients/quick-client-dialog";

export function ProjectForm({ data, draft, setDraft, createClient, onSave, onCancel }: {
  data: AppData;
  draft: ProjectDraft;
  setDraft: React.Dispatch<React.SetStateAction<ProjectDraft>>;
  createClient: (draft: ClientDraft) => string | undefined;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { b, locale } = useBusinessUi();
  const [submitted, setSubmitted] = useState(false);
  const activeClients = data.clients.filter((client) => !client.archived);
  const errors = submitted ? validateProjectDraft(draft, locale) : {};
  const firstError = errors.name ?? errors.clientId ?? errors.rate ?? errors.budgetHours;
  const selectClient = (clientId: string) => setDraft((previous) => ({ ...previous, clientId }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateProjectDraft(draft, locale);
    setSubmitted(true);
    if (hasFormErrors(nextErrors)) return;
    onSave();
  };

  return (
    <SurfaceCard as="section" className="mb-5 p-5">
      <SectionHeading icon={<FolderPlus />} eyebrow={b("projects.form.eyebrow")} title={b("projects.form.title")} description={b("projects.form.description")} />
      <form onSubmit={submit} noValidate>
        <FormFeedback message={firstError} className="mb-4" />
        <div className="mb-4 grid grid-cols-3 gap-4 max-[620px]:grid-cols-1">
          <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">{b("projects.form.name")}
            <Input autoFocus aria-invalid={Boolean(errors.name)} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
            <FieldError message={errors.name} />
          </label>
          <div className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">
            <div className="flex items-center justify-between gap-2"><span>{b("common.client")}</span><QuickClientDialog compact onCreate={createClient} onCreated={selectClient} /></div>
            {activeClients.length > 0 ? (
              <Select value={draft.clientId} onValueChange={selectClient}>
                <SelectTrigger aria-invalid={Boolean(errors.clientId)}><SelectValue placeholder={b("projects.form.selectClient")} /></SelectTrigger>
                <SelectContent>{activeClients.map((client) => <SelectItem value={client.id} key={client.id}>{client.name}</SelectItem>)}</SelectContent>
              </Select>
            ) : (
              <div className="flex min-h-11 items-center gap-2 rounded-[var(--control-radius)] border border-dashed border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 text-[10px] text-[var(--text-muted)]">
                <Users aria-hidden="true" className="size-4 shrink-0" />
                <span>{b("projects.form.noClient")}</span>
              </div>
            )}
            <FieldError message={errors.clientId} />
          </div>
          <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">{b("projects.form.rate")}
            <NumberField value={draft.rate} onValueChange={(rate) => setDraft({ ...draft, rate })} />
            <FieldError message={errors.rate} />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">{b("projects.form.budget")}
            <NumberField value={draft.budgetHours} onValueChange={(budgetHours) => setDraft({ ...draft, budgetHours })} />
            <FieldError message={errors.budgetHours} />
          </label>
          <label className="col-span-2 grid gap-2 text-xs font-semibold text-[var(--text-muted)] max-[620px]:col-auto">{b("common.description")}<Input value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} /></label>
        </div>
        <div className="flex items-center gap-2 max-[620px]:flex-wrap"><Button type="submit"><Save /> {b("projects.form.save")}</Button><Button type="button" variant="outline" onClick={onCancel}>{b("common.cancel")}</Button></div>
      </form>
    </SurfaceCard>
  );
}
