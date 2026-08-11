"use client";

import { useState } from "react";
import { FolderPlus, Plus, Save, Users } from "lucide-react";
import { FormFeedback } from "@/components/common/form-feedback";
import { PanelHead } from "@/components/common/panel-head";
import { SurfaceCard } from "@/components/common/surface-card";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { QuickClientDialog } from "@/components/pages/clients/quick-client-dialog";
import { QuickProjectDialog } from "@/components/pages/projects/quick-project-dialog";
import { TimePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TodayPageProps } from "./types.ts";

export function ManualEntryForm(props: Pick<TodayPageProps, "data" | "selectedDate" | "setData" | "setEditingEntry" | "createClient" | "createProject">) {
  const { t } = useLocaleUi();
  const firstProject = props.data.projects.find((item) => item.status === "active");
  const [draft, setDraft] = useState({ projectId: firstProject?.id ?? "", start: "09:00", end: "10:00", note: "", billable: true });
  const [pendingClientId, setPendingClientId] = useState("");
  const [error, setError] = useState("");
  const selectedProject = props.data.projects.find((project) => project.id === draft.projectId);
  const selectedClientId = selectedProject?.clientId ?? pendingClientId;
  const selectedClient = props.data.clients.find((client) => client.id === selectedClientId && !client.archived);
  const activeClients = props.data.clients.filter((client) => !client.archived);
  const projects = props.data.projects.filter((project) => project.status === "active" && project.clientId === selectedClientId);

  const selectClient = (clientId: string) => {
    setError("");
    setPendingClientId(clientId);
    setDraft((current) => ({ ...current, projectId: "" }));
  };
  const selectProject = (projectId: string) => {
    setError("");
    setPendingClientId("");
    setDraft((current) => ({ ...current, projectId }));
  };

  function save(event: React.FormEvent) {
    event.preventDefault();
    const project = props.data.projects.find((item) => item.id === draft.projectId);
    if (!project) return setError(t("today.manual.errorProject"));
    const startedAt = new Date(`${props.selectedDate}T${draft.start}:00`).getTime();
    const endedAt = new Date(`${props.selectedDate}T${draft.end}:00`).getTime();
    if (!Number.isFinite(startedAt) || !Number.isFinite(endedAt) || endedAt <= startedAt) return setError(t("today.manual.errorEnd"));
    const overlaps = props.data.timeEntries.some((entry) => startedAt < (entry.endedAt ? new Date(entry.endedAt).getTime() : Date.now()) && endedAt > new Date(entry.startedAt).getTime());
    if (overlaps) return setError(t("today.manual.errorOverlap"));
    props.setData((previous) => ({
      ...previous,
      timeEntries: [{
        id: crypto.randomUUID(),
        clientId: project.clientId,
        projectId: project.id,
        task: draft.note || t("today.manual.defaultTask"),
        startedAt: new Date(startedAt).toISOString(),
        endedAt: new Date(endedAt).toISOString(),
        note: draft.note,
        billable: draft.billable,
        effectiveRate: project.rate,
      }, ...previous.timeEntries],
    }));
    props.setEditingEntry("");
  }

  return (
    <SurfaceCard className="mb-[18px] p-5 [&_.panel-head]:mb-4">
      <PanelHead icon={<Plus />} title={t("today.manual.title")}><Button type="button" variant="ghost" onClick={() => props.setEditingEntry("")}>{t("common.close")}</Button></PanelHead>
      <form onSubmit={save} noValidate>
        <FormFeedback message={error} className="mb-4" />
        <div className="mb-4 grid grid-cols-3 gap-3.5 max-[760px]:grid-cols-2 max-[620px]:grid-cols-1">
          <div className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">
            <div className="flex items-center justify-between gap-2"><span>{t("common.client")}</span><QuickClientDialog compact onCreate={props.createClient} onCreated={selectClient} /></div>
            {activeClients.length ? (
              <Select value={selectedClientId} onValueChange={selectClient}><SelectTrigger><SelectValue placeholder={t("today.relations.chooseClient")} /></SelectTrigger><SelectContent>{activeClients.map((client) => <SelectItem value={client.id} key={client.id}>{client.name}</SelectItem>)}</SelectContent></Select>
            ) : (
              <div className="flex min-h-11 items-center gap-2 rounded-[var(--control-radius)] border border-dashed border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 text-[10px]"><Users aria-hidden="true" className="size-4" /><span>{t("today.manual.noClient")}</span></div>
            )}
          </div>
          <div className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">
            <div className="flex items-center justify-between gap-2"><span>{t("common.project")}</span>{selectedClient && <QuickProjectDialog client={selectedClient} onCreate={props.createProject} onCreated={selectProject} label={t("today.relations.newProject")} />}</div>
            {!selectedClientId ? (
              <div className="flex min-h-11 items-center gap-2 rounded-[var(--control-radius)] border border-dashed border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 text-[10px]"><FolderPlus aria-hidden="true" className="size-4" /><span>{t("today.relations.chooseClientFirst")}</span></div>
            ) : projects.length ? (
              <Select value={draft.projectId} onValueChange={selectProject}><SelectTrigger><SelectValue placeholder={t("today.relations.chooseProject")} /></SelectTrigger><SelectContent>{projects.map((project) => <SelectItem value={project.id} key={project.id}>{project.name}</SelectItem>)}</SelectContent></Select>
            ) : (
              <div className="flex min-h-11 items-center gap-2 rounded-[var(--control-radius)] border border-dashed border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 text-[10px]"><FolderPlus aria-hidden="true" className="size-4" /><span>{t("today.manual.noProjectForClient")}</span></div>
            )}
          </div>
          <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">{t("common.start")}<TimePicker value={draft.start} onChange={(start) => { setError(""); setDraft({ ...draft, start }); }} /></label>
          <label className="grid gap-2 text-xs font-semibold text-[var(--text-muted)]">{t("common.end")}<TimePicker value={draft.end} onChange={(end) => { setError(""); setDraft({ ...draft, end }); }} /></label>
          <label className="col-span-2 grid gap-2 text-xs font-semibold text-[var(--text-muted)] max-[620px]:col-auto">{t("common.description")}<Input autoFocus value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} placeholder={t("today.manual.notePlaceholder")} /></label>
          <label className="flex min-h-11 items-center gap-2.5 self-end rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-2)] px-3 text-[var(--text)]"><Checkbox checked={draft.billable} onCheckedChange={(billable) => setDraft({ ...draft, billable })} /> {t("common.billable")}</label>
        </div>
        <div className="flex flex-wrap items-center gap-2"><Button type="submit"><Save /> {t("today.manual.save")}</Button><span className="text-[10px] text-[var(--text-muted)]">{t("today.manual.saveHint")}</span></div>
      </form>
    </SurfaceCard>
  );
}
