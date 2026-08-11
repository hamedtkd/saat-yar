"use client";

import { useState } from "react";
import { FolderPlus, Users } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { QuickClientDialog } from "@/components/pages/clients/quick-client-dialog";
import { QuickProjectDialog } from "@/components/pages/projects/quick-project-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AppData, ClientDraft, ProjectDraft, TimerDraft } from "@/lib/types";

type Props = {
  data: AppData;
  timerDraft: TimerDraft;
  setTimerDraft: React.Dispatch<React.SetStateAction<TimerDraft>>;
  createClient: (draft: ClientDraft) => string | undefined;
  createProject: (draft: ProjectDraft) => string | undefined;
};

export function TimerRelationFields({ data, timerDraft, setTimerDraft, createClient, createProject }: Props) {
  const { t } = useLocaleUi();
  const currentProject = data.projects.find((project) => project.id === timerDraft.projectId);
  const [pendingClientId, setPendingClientId] = useState("");
  const selectedClientId = currentProject?.clientId ?? pendingClientId;
  const selectedClient = data.clients.find((client) => client.id === selectedClientId && !client.archived);
  const activeClients = data.clients.filter((client) => !client.archived);
  const availableProjects = data.projects.filter((project) => project.status === "active" && project.clientId === selectedClientId);

  const selectClient = (clientId: string) => {
    setPendingClientId(clientId);
    setTimerDraft((previous) => ({ ...previous, projectId: "" }));
  };
  const selectProject = (projectId: string) => {
    setPendingClientId("");
    setTimerDraft((previous) => ({ ...previous, projectId }));
  };

  return (
    <>
      <div className="col-span-4 grid min-w-0 gap-2 text-xs font-bold text-[var(--text-muted)] max-[720px]:col-span-12">
        <div className="flex items-center justify-between gap-2"><span>{t("common.client")}</span><QuickClientDialog compact onCreate={createClient} onCreated={selectClient} /></div>
        {activeClients.length ? (
          <Select value={selectedClientId} onValueChange={selectClient}>
            <SelectTrigger><SelectValue placeholder={t("today.relations.chooseClient")} /></SelectTrigger>
            <SelectContent>{activeClients.map((client) => <SelectItem value={client.id} key={client.id}>{client.name}</SelectItem>)}</SelectContent>
          </Select>
        ) : (
          <div className="flex min-h-11 items-center gap-2 rounded-[var(--control-radius)] border border-dashed border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 text-[10px] font-medium text-[var(--text-muted)]">
            <Users aria-hidden="true" className="size-4 shrink-0" /><span>{t("today.relations.noClientTimer")}</span>
          </div>
        )}
      </div>
      <div className="col-span-4 grid min-w-0 gap-2 text-xs font-bold text-[var(--text-muted)] max-[720px]:col-span-12">
        <div className="flex items-center justify-between gap-2">
          <span>{t("common.project")}</span>
          {selectedClient && <QuickProjectDialog client={selectedClient} onCreate={createProject} onCreated={selectProject} label={t("today.relations.newProject")} />}
        </div>
        {!selectedClientId ? (
          <div className="flex min-h-11 items-center gap-2 rounded-[var(--control-radius)] border border-dashed border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 text-[10px] font-medium text-[var(--text-muted)]">
            <FolderPlus aria-hidden="true" className="size-4 shrink-0" /><span>{t("today.relations.chooseClientFirst")}</span>
          </div>
        ) : availableProjects.length ? (
          <Select value={timerDraft.projectId} onValueChange={selectProject}>
            <SelectTrigger><SelectValue placeholder={t("today.relations.chooseProject")} /></SelectTrigger>
            <SelectContent>{availableProjects.map((project) => <SelectItem value={project.id} key={project.id}>{project.name}</SelectItem>)}</SelectContent>
          </Select>
        ) : (
          <div className="flex min-h-11 items-center gap-2 rounded-[var(--control-radius)] border border-dashed border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 text-[10px] font-medium text-[var(--text-muted)]">
            <FolderPlus aria-hidden="true" className="size-4 shrink-0" /><span>{t("today.relations.noActiveProject")}</span>
          </div>
        )}
      </div>
    </>
  );
}
