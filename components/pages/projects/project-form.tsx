import { FolderPlus, Save, Users } from "lucide-react";
import { NumberField } from "@/components/common/number-field";
import { SectionHeading } from "@/components/common/section-heading";
import { SurfaceCard } from "@/components/common/surface-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AppData, ClientDraft, ProjectDraft } from "@/lib/types";
import { QuickClientDialog } from "../clients/quick-client-dialog";

export function ProjectForm({ data, draft, setDraft, createClient, onSave, onCancel }: {
  data: AppData;
  draft: ProjectDraft;
  setDraft: React.Dispatch<React.SetStateAction<ProjectDraft>>;
  createClient: (draft: ClientDraft) => string | undefined;
  onSave: () => void;
  onCancel: () => void;
}) {
  const activeClients = data.clients.filter((client) => !client.archived);
  const selectClient = (clientId: string) => setDraft((previous) => ({ ...previous, clientId }));

  return (
    <SurfaceCard as="section" className="mb-5 p-5">
      <SectionHeading icon={<FolderPlus />} eyebrow="پروژه جدید" title="مشخصات پروژه" description="مشتری، نرخ و بودجه را از ابتدا مشخص کن تا گزارش‌ها دقیق بمانند." />
      <div className="mb-4 grid grid-cols-3 gap-4 max-[620px]:grid-cols-1">
        <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">نام پروژه<Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
        <div className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">
          <div className="flex items-center justify-between gap-2"><span>مشتری</span><QuickClientDialog compact onCreate={createClient} onCreated={selectClient} /></div>
          {activeClients.length > 0 ? (
            <Select value={draft.clientId} onValueChange={selectClient}>
              <SelectTrigger><SelectValue placeholder="انتخاب مشتری" /></SelectTrigger>
              <SelectContent>{activeClients.map((client) => <SelectItem value={client.id} key={client.id}>{client.name}</SelectItem>)}</SelectContent>
            </Select>
          ) : (
            <div className="flex min-h-11 items-center gap-2 rounded-[var(--control-radius)] border border-dashed border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 text-[10px] text-[var(--text-muted)]">
              <Users aria-hidden="true" className="size-4 shrink-0" />
              <span>هنوز مشتری فعالی نداری؛ از «مشتری جدید» همین بالا استفاده کن.</span>
            </div>
          )}
        </div>
        <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">نرخ ساعتی<NumberField value={draft.rate} onValueChange={(rate) => setDraft({ ...draft, rate })} /></label>
        <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">بودجه ساعتی<NumberField value={draft.budgetHours} onValueChange={(budgetHours) => setDraft({ ...draft, budgetHours })} /></label>
        <label className="col-span-2 grid gap-2 text-xs font-semibold text-[var(--text-muted)] max-[620px]:col-auto">توضیح<Input value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} /></label>
      </div>
      <div className="flex items-center gap-2 max-[620px]:flex-wrap"><Button onClick={onSave}><Save /> ذخیره پروژه</Button><Button variant="outline" onClick={onCancel}>انصراف</Button></div>
    </SurfaceCard>
  );
}
