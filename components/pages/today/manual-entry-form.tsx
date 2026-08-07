"use client";

import { useState } from "react";
import { FolderPlus, Plus, Save, Users } from "lucide-react";
import { QuickClientDialog } from "@/components/pages/clients/quick-client-dialog";
import { QuickProjectDialog } from "@/components/pages/projects/quick-project-dialog";
import { PanelHead } from "@/components/common/panel-head";
import { SurfaceCard } from "@/components/common/surface-card";
import { TimePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TodayPageProps } from "./types.ts";

export function ManualEntryForm(props: Pick<TodayPageProps, "data" | "selectedDate" | "setData" | "setEditingEntry" | "createClient" | "createProject">) {
  const firstProject = props.data.projects.find((item) => item.status === "active");
  const [draft, setDraft] = useState({ projectId: firstProject?.id ?? "", start: "09:00", end: "10:00", note: "", billable: true });
  const [pendingClientId, setPendingClientId] = useState("");
  const selectedProject = props.data.projects.find((project) => project.id === draft.projectId);
  const selectedClientId = selectedProject?.clientId ?? pendingClientId;
  const selectedClient = props.data.clients.find((client) => client.id === selectedClientId && !client.archived);
  const activeClients = props.data.clients.filter((client) => !client.archived);
  const projects = props.data.projects.filter((project) => project.status === "active" && project.clientId === selectedClientId);

  const selectClient = (clientId: string) => {
    setPendingClientId(clientId);
    setDraft((current) => ({ ...current, projectId: "" }));
  };
  const selectProject = (projectId: string) => {
    setPendingClientId("");
    setDraft((current) => ({ ...current, projectId }));
  };

  function save() {
    const project = props.data.projects.find((item) => item.id === draft.projectId);
    if (!project) return alert("برای ثبت دستی، ابتدا پروژه را انتخاب کنید.");
    const startedAt = new Date(`${props.selectedDate}T${draft.start}:00`).getTime();
    const endedAt = new Date(`${props.selectedDate}T${draft.end}:00`).getTime();
    if (!Number.isFinite(startedAt) || !Number.isFinite(endedAt) || endedAt <= startedAt) return alert("زمان شروع و پایان معتبر نیست.");
    const overlaps = props.data.timeEntries.some((entry) => startedAt < (entry.endedAt ? new Date(entry.endedAt).getTime() : Date.now()) && endedAt > new Date(entry.startedAt).getTime());
    if (overlaps) return alert("این بازه با رکورد دیگری هم‌پوشانی دارد.");
    props.setData((previous) => ({ ...previous, timeEntries: [{ id: crypto.randomUUID(), clientId: project.clientId, projectId: project.id, task: draft.note || "ورودی دستی", startedAt: new Date(startedAt).toISOString(), endedAt: new Date(endedAt).toISOString(), note: draft.note, billable: draft.billable, effectiveRate: project.rate }, ...previous.timeEntries] }));
    props.setEditingEntry("");
  }

  return (
    <SurfaceCard className="mb-[18px] p-5 [&_.panel-head]:mb-4">
      <PanelHead icon={<Plus />} title="ثبت دستی زمان پروژه"><Button variant="ghost" onClick={() => props.setEditingEntry("")}>بستن</Button></PanelHead>
      <div className="mb-4 grid grid-cols-3 gap-3.5 max-[760px]:grid-cols-2 max-[620px]:grid-cols-1">
        <div className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">
          <div className="flex items-center justify-between gap-2"><span>مشتری</span><QuickClientDialog compact onCreate={props.createClient} onCreated={selectClient} /></div>
          {activeClients.length ? (
            <Select value={selectedClientId} onValueChange={selectClient}><SelectTrigger><SelectValue placeholder="انتخاب مشتری" /></SelectTrigger><SelectContent>{activeClients.map((client) => <SelectItem value={client.id} key={client.id}>{client.name}</SelectItem>)}</SelectContent></Select>
          ) : (
            <div className="flex min-h-11 items-center gap-2 rounded-[var(--control-radius)] border border-dashed border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 text-[10px]"><Users className="size-4" /><span>مشتری را همین‌جا بساز.</span></div>
          )}
        </div>
        <div className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">
          <div className="flex items-center justify-between gap-2"><span>پروژه</span>{selectedClient && <QuickProjectDialog client={selectedClient} onCreate={props.createProject} onCreated={selectProject} label="پروژه جدید" />}</div>
          {!selectedClientId ? (
            <div className="flex min-h-11 items-center gap-2 rounded-[var(--control-radius)] border border-dashed border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 text-[10px]"><FolderPlus className="size-4" /><span>ابتدا مشتری را انتخاب کن.</span></div>
          ) : projects.length ? (
            <Select value={draft.projectId} onValueChange={selectProject}><SelectTrigger><SelectValue placeholder="انتخاب پروژه" /></SelectTrigger><SelectContent>{projects.map((project) => <SelectItem value={project.id} key={project.id}>{project.name}</SelectItem>)}</SelectContent></Select>
          ) : (
            <div className="flex min-h-11 items-center gap-2 rounded-[var(--control-radius)] border border-dashed border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 text-[10px]"><FolderPlus className="size-4" /><span>پروژه‌ای نیست؛ پروژه جدید بساز.</span></div>
          )}
        </div>
        <label>شروع<TimePicker value={draft.start} onChange={(start) => setDraft({ ...draft, start })} /></label>
        <label>پایان<TimePicker value={draft.end} onChange={(end) => setDraft({ ...draft, end })} /></label>
        <label className="col-span-2 max-[620px]:col-auto">شرح<Input value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} placeholder="مثلاً جلسه طراحی" /></label>
        <label className="flex min-h-11 items-center gap-2.5 self-end rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-2)] px-3 text-[var(--text)]"><Checkbox checked={draft.billable} onCheckedChange={(billable) => setDraft({ ...draft, billable })} /> قابل صورتحساب</label>
      </div>
      <Button onClick={save}><Save /> ذخیره ورودی</Button>
    </SurfaceCard>
  );
}
