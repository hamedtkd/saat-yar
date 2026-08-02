import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ClientDraft } from "@/lib/types";
import { cn } from "@/lib/cn";

export function ClientForm({ draft, setDraft, onSave, onCancel }: {
  draft: ClientDraft;
  setDraft: React.Dispatch<React.SetStateAction<ClientDraft>>;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <section className={cn("mb-[18px] p-[18px]", "rounded-[15px] border border-[#dfe7e9] bg-white/95 shadow-[0_10px_35px_rgba(17,45,55,.055)] p-4")}>
      <div className={cn("mb-4 grid gap-[14px]", "grid-cols-3 max-[620px]:grid-cols-1")}><label>نام مشتری<Input autoFocus value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label><label>ایمیل اختیاری<Input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label><label>توضیح<Input value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} /></label></div>
      <div className={cn("flex items-center gap-[9px] max-[620px]:flex-wrap")}><Button onClick={onSave}><Save /> ذخیره مشتری</Button><Button variant="outline" onClick={onCancel}>انصراف</Button></div>
    </section>
  );
}
