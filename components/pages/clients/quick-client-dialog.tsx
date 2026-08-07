"use client";

import { useState } from "react";
import { Plus, Save, UserPlus } from "lucide-react";
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
import type { ClientDraft } from "@/lib/types";
import { initialClientDraft } from "@/hooks/controller/defaults";

export function QuickClientDialog({ onCreate, onCreated, compact = false }: {
  onCreate: (draft: ClientDraft) => string | undefined;
  onCreated: (id: string) => void;
  compact?: boolean;
}) {
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
          <Plus aria-hidden="true" /> مشتری جدید
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2 text-[var(--accent-strong)]"><UserPlus aria-hidden="true" className="size-5" /><span className="text-xs font-bold">ساخت بدون خروج از فرم</span></div>
          <DialogTitle>مشتری جدید</DialogTitle>
          <DialogDescription>مشتری را همین‌جا بساز؛ بعد از ذخیره به‌صورت خودکار برای پروژه انتخاب می‌شود.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)] sm:col-span-2">نام مشتری
            <Input autoFocus value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">ایمیل اختیاری
            <Input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">توضیح
            <Input value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} />
          </label>
        </div>
        <DialogFooter>
          <Button type="button" onClick={save} disabled={!draft.name.trim()}><Save aria-hidden="true" /> ذخیره و انتخاب</Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>انصراف</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
