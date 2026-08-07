import { FilePlus2, FolderPlus, Users } from "lucide-react";
import { NumberField } from "@/components/common/number-field";
import { JalaliDatePicker } from "@/components/pickers";
import { SectionHeading } from "@/components/common/section-heading";
import { SurfaceCard } from "@/components/common/surface-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Client, ClientDraft, Project, ProjectDraft } from "@/lib/types";
import { QuickClientDialog } from "@/components/pages/clients/quick-client-dialog";
import { QuickProjectDialog } from "@/components/pages/projects/quick-project-dialog";
import type { InvoiceDraft } from "../types";

export function InvoiceForm({ clients, projects, draft, setDraft, createClient, createProject, onSave, onCancel }: {
  clients: Client[];
  projects: Project[];
  draft: InvoiceDraft;
  setDraft: React.Dispatch<React.SetStateAction<InvoiceDraft>>;
  createClient: (draft: ClientDraft) => string | undefined;
  createProject: (draft: ProjectDraft) => string | undefined;
  onSave: () => void;
  onCancel: () => void;
}) {
  const activeClients = clients.filter((client) => !client.archived);
  const selectedClient = activeClients.find((client) => client.id === draft.clientId);
  const visibleProjects = projects.filter((project) => project.status === "active" && project.clientId === draft.clientId);
  const fieldClass = "grid gap-2 text-xs font-semibold text-[var(--text-muted)]";
  const selectClient = (clientId: string) => setDraft((value) => ({ ...value, clientId, projectId: "" }));
  const selectProject = (projectId: string) => setDraft((value) => ({ ...value, projectId }));

  return (
    <SurfaceCard as="section" className="mb-5 p-5">
      <SectionHeading icon={<FilePlus2 />} eyebrow="فاکتور جدید" title="مشخصات صورتحساب" description="مشتری، شرح، مبلغ و سررسید را قبل از ذخیره بررسی کن." />
      <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
        <div className={fieldClass}>
          <div className="flex items-center justify-between gap-2"><span>مشتری</span><QuickClientDialog compact onCreate={createClient} onCreated={selectClient} /></div>
          {activeClients.length ? (
            <Select value={draft.clientId} onValueChange={selectClient}>
              <SelectTrigger><SelectValue placeholder="انتخاب مشتری" /></SelectTrigger>
              <SelectContent>{activeClients.map((client) => <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>)}</SelectContent>
            </Select>
          ) : (
            <div className="flex min-h-11 items-center gap-2 rounded-[var(--control-radius)] border border-dashed border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 text-[10px] text-[var(--text-muted)]">
              <Users aria-hidden="true" className="size-4 shrink-0" /><span>هنوز مشتری فعالی نداری؛ مشتری را همین‌جا بساز.</span>
            </div>
          )}
        </div>
        <div className={fieldClass}>
          <div className="flex items-center justify-between gap-2">
            <span>پروژه</span>
            {selectedClient && <QuickProjectDialog client={selectedClient} onCreate={createProject} onCreated={selectProject} label="پروژه جدید" />}
          </div>
          {!draft.clientId ? (
            <div className="flex min-h-11 items-center gap-2 rounded-[var(--control-radius)] border border-dashed border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 text-[10px] text-[var(--text-muted)]">
              <FolderPlus aria-hidden="true" className="size-4 shrink-0" /><span>برای انتخاب یا ساخت پروژه، ابتدا مشتری را مشخص کن.</span>
            </div>
          ) : (
            <Select value={draft.projectId || "none"} onValueChange={(projectId) => selectProject(projectId === "none" ? "" : projectId)}>
              <SelectTrigger><SelectValue placeholder="بدون پروژه" /></SelectTrigger>
              <SelectContent><SelectItem value="none">بدون پروژه</SelectItem>{visibleProjects.map((project) => <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </div>
        <div className={fieldClass}><span>تاریخ صدور</span><JalaliDatePicker value={draft.issuedAt} onChange={(issuedAt) => setDraft((value) => ({ ...value, issuedAt }))} placeholder="تاریخ صدور" /></div>
        <div className={fieldClass}><span>تاریخ سررسید</span><JalaliDatePicker value={draft.dueAt} onChange={(dueAt) => setDraft((value) => ({ ...value, dueAt }))} placeholder="تاریخ سررسید" /></div>
        <label className={`${fieldClass} col-span-2 max-[620px]:col-auto`}>شرح<Input value={draft.description} onChange={(event) => setDraft((value) => ({ ...value, description: event.target.value }))} /></label>
        <label className={fieldClass}>تعداد<NumberField value={draft.quantity} onValueChange={(quantity) => setDraft((value) => ({ ...value, quantity }))} /></label>
        <label className={fieldClass}>مبلغ واحد<NumberField value={draft.unitPrice} onValueChange={(unitPrice) => setDraft((value) => ({ ...value, unitPrice }))} /></label>
        <label className={fieldClass}>تخفیف<NumberField value={draft.discount} onValueChange={(discount) => setDraft((value) => ({ ...value, discount }))} /></label>
        <label className={fieldClass}>مالیات (درصد)<NumberField value={draft.taxPercent} onValueChange={(taxPercent) => setDraft((value) => ({ ...value, taxPercent }))} /></label>
        <label className={`${fieldClass} col-span-2 max-[620px]:col-auto`}>یادداشت<Input value={draft.note} onChange={(event) => setDraft((value) => ({ ...value, note: event.target.value }))} /></label>
      </div>
      <div className="mt-4 flex gap-2"><Button onClick={onSave}>ذخیره فاکتور</Button><Button variant="outline" onClick={onCancel}>لغو</Button></div>
    </SurfaceCard>
  );
}
