"use client";

import { useState } from "react";
import { Save, UserPlus } from "lucide-react";
import { FieldError, FormFeedback } from "@/components/common/form-feedback";
import { SectionHeading } from "@/components/common/section-heading";
import { SurfaceCard } from "@/components/common/surface-card";
import { useBusinessUi } from "@/components/i18n/use-business-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hasFormErrors, validateClientDraft } from "@/lib/business-form-validation";
import type { ClientDraft } from "@/lib/types";

export function ClientForm({ draft, setDraft, onSave, onCancel }: {
  draft: ClientDraft;
  setDraft: React.Dispatch<React.SetStateAction<ClientDraft>>;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { b, locale } = useBusinessUi();
  const [submitted, setSubmitted] = useState(false);
  const errors = submitted ? validateClientDraft(draft, locale) : {};
  const firstError = errors.name ?? errors.email;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateClientDraft(draft, locale);
    setSubmitted(true);
    if (hasFormErrors(nextErrors)) return;
    onSave();
  };

  return (
    <SurfaceCard as="section" className="mb-5 p-5">
      <SectionHeading icon={<UserPlus />} eyebrow={b("clients.form.eyebrow")} title={b("clients.form.title")} description={b("clients.form.description")} />
      <form onSubmit={submit} noValidate>
        <FormFeedback message={firstError} className="mb-4" />
        <div className="mb-4 grid grid-cols-3 gap-4 max-[620px]:grid-cols-1">
          <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">{b("clients.form.name")}
            <Input autoFocus aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "client-name-error" : undefined} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
            <FieldError id="client-name-error" message={errors.name} />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">{b("common.optionalEmail")}
            <Input type="email" inputMode="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "client-email-error" : undefined} value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
            <FieldError id="client-email-error" message={errors.email} />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">{b("common.description")}<Input value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} /></label>
        </div>
        <div className="flex items-center gap-2 max-[620px]:flex-wrap">
          <Button type="submit"><Save /> {b("clients.form.save")}</Button>
          <Button type="button" variant="outline" onClick={onCancel}>{b("common.cancel")}</Button>
          <span className="text-[10px] text-[var(--text-muted)]">{b("clients.form.hint")}</span>
        </div>
      </form>
    </SurfaceCard>
  );
}
