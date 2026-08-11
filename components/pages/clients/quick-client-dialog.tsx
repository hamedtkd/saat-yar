"use client";

import { useState } from "react";
import { Plus, Save, UserPlus } from "lucide-react";
import { useBusinessUi } from "@/components/i18n/use-business-ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { initialClientDraft } from "@/hooks/controller/defaults";
import type { ClientDraft } from "@/lib/types";

export function QuickClientDialog({ onCreate, onCreated, compact = false }: {
  onCreate: (draft: ClientDraft) => string | undefined;
  onCreated: (id: string) => void;
  compact?: boolean;
}) {
  const { b } = useBusinessUi();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ClientDraft>(initialClientDraft);

  const start = () => {
    setDraft(initialClientDraft);
    setOpen(true);
  };

  const save = () => {
    const id = onCreate(draft);
    if (!id) return;
    onCreated(id);
    setDraft(initialClientDraft);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant={compact ? "ghost" : "outline"} size="sm" onClick={start}>
          <Plus aria-hidden="true" /> {b("clients.new")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2 text-[var(--accent-strong)]"><UserPlus aria-hidden="true" className="size-5" /><span className="text-xs font-bold">{b("clients.quick.badge")}</span></div>
          <DialogTitle>{b("clients.new")}</DialogTitle>
          <DialogDescription>{b("clients.quick.description")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)] sm:col-span-2">{b("clients.form.name")}
            <Input autoFocus value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">{b("common.optionalEmail")}
            <Input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">{b("common.description")}
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
