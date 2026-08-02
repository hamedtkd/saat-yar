import { Save } from "lucide-react";
import { NumberField } from "@/components/common/number-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AppData, ProjectDraft } from "@/lib/types";
import { cn } from "@/lib/cn";

export function ProjectForm({ data, draft, setDraft, onSave, onCancel }: {
  data: AppData;
  draft: ProjectDraft;
  setDraft: React.Dispatch<React.SetStateAction<ProjectDraft>>;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <section className={cn("mb-[18px] p-[18px]", "rounded-[15px] border border-[#dfe7e9] bg-white/95 shadow-[0_10px_35px_rgba(17,45,55,.055)] p-4")}>
      <div className={cn("mb-4 grid gap-[14px]", "grid-cols-3 max-[620px]:grid-cols-1")}><label>نام پروژه<Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label><label>مشتری<Select value={draft.clientId} onValueChange={(clientId) => setDraft({ ...draft, clientId })}><SelectTrigger><SelectValue placeholder="انتخاب مشتری" /></SelectTrigger><SelectContent>{data.clients.filter((client) => !client.archived).map((client) => <SelectItem value={client.id} key={client.id}>{client.name}</SelectItem>)}</SelectContent></Select></label><label>نرخ ساعتی<NumberField value={draft.rate} onValueChange={(rate) => setDraft({ ...draft, rate })} /></label><label>بودجه ساعتی<NumberField value={draft.budgetHours} onValueChange={(budgetHours) => setDraft({ ...draft, budgetHours })} /></label><label className={cn("col-span-2 max-[620px]:col-auto")}>توضیح<Input value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} /></label></div>
      <div className={cn("flex items-center gap-[9px] max-[620px]:flex-wrap")}><Button onClick={onSave}><Save /> ذخیره پروژه</Button><Button variant="outline" onClick={onCancel}>انصراف</Button></div>
    </section>
  );
}
