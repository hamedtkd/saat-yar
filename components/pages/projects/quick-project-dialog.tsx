"use client";

import { useState } from "react";
import { FolderPlus, Save } from "lucide-react";
import { NumberField } from "@/components/common/number-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { initialProjectDraft } from "@/hooks/controller/defaults";
import type { Client, ProjectDraft } from "@/lib/types";

export function QuickProjectDialog({ client, onCreate }: {
  client: Client;
  onCreate: (draft: ProjectDraft) => string | undefined;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ProjectDraft>({ ...initialProjectDraft, clientId: client.id });

  const start = () => {
    setDraft({ ...initialProjectDraft, clientId: client.id });
    setOpen(true);
  };

  const save = () => {
    const id = onCreate(draft);
    if (!id) return;
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" onClick={start} title={`پروژه جدید برای ${client.name}`}>
          <FolderPlus aria-hidden="true" /> پروژه
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2 text-[var(--accent-strong)]"><FolderPlus aria-hidden="true" className="size-5" /><span className="text-xs font-bold">پروژه مرتبط</span></div>
          <DialogTitle>پروژه جدید برای {client.name}</DialogTitle>
          <DialogDescription>پروژه بدون خروج از صفحه مشتری‌ها ساخته و مستقیماً به همین مشتری متصل می‌شود.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)] sm:col-span-2">نام پروژه
            <Input autoFocus value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">نرخ ساعتی
            <NumberField value={draft.rate} onValueChange={(rate) => setDraft({ ...draft, rate })} />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">بودجه ساعتی
            <NumberField value={draft.budgetHours} onValueChange={(budgetHours) => setDraft({ ...draft, budgetHours })} />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)] sm:col-span-2">توضیح
            <Input value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} />
          </label>
        </div>
        <DialogFooter>
          <Button type="button" onClick={save} disabled={!draft.name.trim()}><Save aria-hidden="true" /> ذخیره پروژه</Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>انصراف</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
