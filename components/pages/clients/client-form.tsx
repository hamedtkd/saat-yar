import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { tw } from "@/lib/tw";
import type { ClientDraft } from "@/lib/types";

export function ClientForm({ draft, setDraft, onSave, onCancel }: {
  draft: ClientDraft;
  setDraft: React.Dispatch<React.SetStateAction<ClientDraft>>;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <section className={tw("inline-form", "panel")}>
      <div className={tw("form-grid", "three")}><label>نام مشتری<Input autoFocus value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label><label>ایمیل اختیاری<Input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label><label>توضیح<Input value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} /></label></div>
      <div className={tw("row-actions")}><Button onClick={onSave}><Save /> ذخیره مشتری</Button><Button variant="outline" onClick={onCancel}>انصراف</Button></div>
    </section>
  );
}
