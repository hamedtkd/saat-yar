import { Save } from "lucide-react";
import { SurfaceCard } from "@/components/common/surface-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ClientDraft } from "@/lib/types";

export function ClientForm({ draft, setDraft, onSave, onCancel }: {
  draft: ClientDraft;
  setDraft: React.Dispatch<React.SetStateAction<ClientDraft>>;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <SurfaceCard as="section" className="mb-5 p-5">
      <div className="mb-4 grid grid-cols-3 gap-4 max-[620px]:grid-cols-1">
        <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">نام مشتری<Input autoFocus value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
        <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">ایمیل اختیاری<Input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label>
        <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">توضیح<Input value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} /></label>
      </div>
      <div className="flex items-center gap-2 max-[620px]:flex-wrap"><Button onClick={onSave}><Save /> ذخیره مشتری</Button><Button variant="outline" onClick={onCancel}>انصراف</Button></div>
    </SurfaceCard>
  );
}
