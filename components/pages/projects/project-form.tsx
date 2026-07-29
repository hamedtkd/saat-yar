import { Save } from "lucide-react";
import { NumberField } from "@/components/common/number-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tw } from "@/lib/tw";
import type { AppData, ProjectDraft } from "@/lib/types";

export function ProjectForm({ data, draft, setDraft, onSave, onCancel }: {
  data: AppData;
  draft: ProjectDraft;
  setDraft: React.Dispatch<React.SetStateAction<ProjectDraft>>;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <section className={tw("inline-form", "panel")}>
      <div className={tw("form-grid", "three")}><label>نام پروژه<Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label><label>مشتری<Select value={draft.clientId} onValueChange={(clientId) => setDraft({ ...draft, clientId })}><SelectTrigger><SelectValue placeholder="انتخاب مشتری" /></SelectTrigger><SelectContent>{data.clients.filter((client) => !client.archived).map((client) => <SelectItem value={client.id} key={client.id}>{client.name}</SelectItem>)}</SelectContent></Select></label><label>نرخ ساعتی<NumberField value={draft.rate} onValueChange={(rate) => setDraft({ ...draft, rate })} /></label><label>بودجه ساعتی<NumberField value={draft.budgetHours} onValueChange={(budgetHours) => setDraft({ ...draft, budgetHours })} /></label><label className={tw("span-2")}>توضیح<Input value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} /></label></div>
      <div className={tw("row-actions")}><Button onClick={onSave}><Save /> ذخیره پروژه</Button><Button variant="outline" onClick={onCancel}>انصراف</Button></div>
    </section>
  );
}
