"use client";

import { useState } from "react";
import { FolderPlus, Save } from "lucide-react";
import { NumberField } from "@/components/common/number-field";
import { useBusinessUi } from "@/components/i18n/use-business-ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { initialProjectDraft } from "@/hooks/controller/defaults";
import type { Client, ProjectDraft } from "@/lib/types";

export function QuickProjectDialog({ client, onCreate, onCreated, compact = true, label }: {
  client: Client;
  onCreate: (draft: ProjectDraft) => string | undefined;
  onCreated?: (id: string) => void;
  compact?: boolean;
  label?: string;
}) {
  const { b } = useBusinessUi();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ProjectDraft>({ ...initialProjectDraft, clientId: client.id });
  const triggerLabel = label ?? b("projects.quick.defaultLabel");

  const start = () => {
    setDraft({ ...initialProjectDraft, clientId: client.id });
    setOpen(true);
  };

  const save = () => {
    const id = onCreate(draft);
    if (!id) return;
    onCreated?.(id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant={compact ? "ghost" : "outline"} size="sm" onClick={start} title={b("projects.quick.titleAttr", { client: client.name })}>
          <FolderPlus aria-hidden="true" /> {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2 text-[var(--accent-strong)]"><FolderPlus aria-hidden="true" className="size-5" /><span className="text-xs font-bold">{b("projects.quick.badge")}</span></div>
          <DialogTitle>{b("projects.quick.title", { client: client.name })}</DialogTitle>
          <DialogDescription>{b("projects.quick.description")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)] sm:col-span-2">{b("projects.form.name")}
            <Input autoFocus value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">{b("projects.form.rate")}
            <NumberField value={draft.rate} onValueChange={(rate) => setDraft({ ...draft, rate })} />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">{b("projects.form.budget")}
            <NumberField value={draft.budgetHours} onValueChange={(budgetHours) => setDraft({ ...draft, budgetHours })} />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)] sm:col-span-2">{b("common.description")}
            <Input value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} />
          </label>
        </div>
        <DialogFooter>
          <Button type="button" onClick={save} disabled={!draft.name.trim()}><Save aria-hidden="true" /> {b("common.saveAndSelect")}</Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>{b("common.cancel")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
