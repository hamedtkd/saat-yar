import { Save } from "lucide-react";
import { NumberField } from "@/components/common/number-field";
import { SurfaceCard } from "@/components/common/surface-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AppData, ProjectDraft } from "@/lib/types";

export function ProjectForm({ data, draft, setDraft, onSave, onCancel }: {
  data: AppData;
  draft: ProjectDraft;
  setDraft: React.Dispatch<React.SetStateAction<ProjectDraft>>;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <SurfaceCard as="section" className="mb-5 p-5">
      <div className="mb-4 grid grid-cols-3 gap-4 max-[620px]:grid-cols-1">
        <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">نام پروژه<Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
        <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">مشتری<Select value={draft.clientId} onValueChange={(clientId) => setDraft({ ...draft, clientId })}><SelectTrigger><SelectValue placeholder="انتخاب مشتری" /></SelectTrigger><SelectContent>{data.clients.filter((client) => !client.archived).map((client) => <SelectItem value={client.id} key={client.id}>{client.name}</SelectItem>)}</SelectContent></Select></label>
        <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">نرخ ساعتی<NumberField value={draft.rate} onValueChange={(rate) => setDraft({ ...draft, rate })} /></label>
        <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">بودجه ساعتی<NumberField value={draft.budgetHours} onValueChange={(budgetHours) => setDraft({ ...draft, budgetHours })} /></label>
        <label className="col-span-2 grid gap-2 text-xs font-semibold text-[var(--text-muted)] max-[620px]:col-auto">توضیح<Input value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} /></label>
      </div>
      <div className="flex items-center gap-2 max-[620px]:flex-wrap"><Button onClick={onSave}><Save /> ذخیره پروژه</Button><Button variant="outline" onClick={onCancel}>انصراف</Button></div>
    </SurfaceCard>
  );
}
