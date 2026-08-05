import { NumberField } from "@/components/common/number-field";
import { SurfaceCard } from "@/components/common/surface-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Client, Project } from "@/lib/types";
import type { InvoiceDraft } from "../types";

export function InvoiceForm({ clients, projects, draft, setDraft, onSave, onCancel }: {
  clients: Client[];
  projects: Project[];
  draft: InvoiceDraft;
  setDraft: React.Dispatch<React.SetStateAction<InvoiceDraft>>;
  onSave: () => void;
  onCancel: () => void;
}) {
  const visibleProjects = projects.filter((project) => !draft.clientId || project.clientId === draft.clientId);
  return (
    <SurfaceCard as="section" className="mb-5 p-4">
      <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
        <label>مشتری<Select value={draft.clientId} onValueChange={(clientId) => setDraft((value) => ({ ...value, clientId, projectId: "" }))}><SelectTrigger><SelectValue placeholder="انتخاب مشتری" /></SelectTrigger><SelectContent>{clients.filter((client) => !client.archived).map((client) => <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>)}</SelectContent></Select></label>
        <label>پروژه<Select value={draft.projectId || "none"} onValueChange={(projectId) => setDraft((value) => ({ ...value, projectId: projectId === "none" ? "" : projectId }))}><SelectTrigger><SelectValue placeholder="بدون پروژه" /></SelectTrigger><SelectContent><SelectItem value="none">بدون پروژه</SelectItem>{visibleProjects.map((project) => <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>)}</SelectContent></Select></label>
        <label>تاریخ صدور<Input type="date" value={draft.issuedAt} onChange={(event) => setDraft((value) => ({ ...value, issuedAt: event.target.value }))} /></label>
        <label>تاریخ سررسید<Input type="date" value={draft.dueAt} onChange={(event) => setDraft((value) => ({ ...value, dueAt: event.target.value }))} /></label>
        <label className="col-span-2 max-[620px]:col-auto">شرح<Input value={draft.description} onChange={(event) => setDraft((value) => ({ ...value, description: event.target.value }))} /></label>
        <label>تعداد<NumberField value={draft.quantity} onValueChange={(quantity) => setDraft((value) => ({ ...value, quantity }))} /></label>
        <label>مبلغ واحد<NumberField value={draft.unitPrice} onValueChange={(unitPrice) => setDraft((value) => ({ ...value, unitPrice }))} /></label>
        <label>تخفیف<NumberField value={draft.discount} onValueChange={(discount) => setDraft((value) => ({ ...value, discount }))} /></label>
        <label>مالیات (درصد)<NumberField value={draft.taxPercent} onValueChange={(taxPercent) => setDraft((value) => ({ ...value, taxPercent }))} /></label>
        <label className="col-span-2 max-[620px]:col-auto">یادداشت<Input value={draft.note} onChange={(event) => setDraft((value) => ({ ...value, note: event.target.value }))} /></label>
      </div>
      <div className="mt-4 flex gap-2"><Button onClick={onSave}>ذخیره فاکتور</Button><Button variant="outline" onClick={onCancel}>لغو</Button></div>
    </SurfaceCard>
  );
}
