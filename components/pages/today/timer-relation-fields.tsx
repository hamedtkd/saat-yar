"use client";

import { useState } from "react";
import { FolderKanban, FolderPlus, UserRound, Users } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { QuickClientDialog } from "@/components/pages/clients/quick-client-dialog";
import { QuickProjectDialog } from "@/components/pages/projects/quick-project-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import type { AppData, ClientDraft, ProjectDraft, TimerDraft } from "@/lib/types";

type Props = {
  data: AppData;
  timerDraft: TimerDraft;
  setTimerDraft: React.Dispatch<React.SetStateAction<TimerDraft>>;
  createClient: (draft: ClientDraft) => string | undefined;
  createProject: (draft: ProjectDraft) => string | undefined;
  lockedProjectId?: string;
  disabled?: boolean;
  variant?: "legacy" | "panel";
};

export function TimerRelationFields({ data, timerDraft, setTimerDraft, createClient, createProject, lockedProjectId, disabled = false, variant = "legacy" }: Props) {
  const { t } = useLocaleUi();
  const effectiveProjectId = lockedProjectId || timerDraft.projectId;
  const currentProject = data.projects.find((project) => project.id === effectiveProjectId);
  const [pendingClientId, setPendingClientId] = useState("");
  const selectedClientId = currentProject?.clientId ?? pendingClientId;
  const selectedClient = data.clients.find((client) => client.id === selectedClientId && !client.archived);
  const activeClients = data.clients.filter((client) => !client.archived);
  const availableProjects = data.projects.filter((project) => project.status === "active" && project.clientId === selectedClientId);

  const selectClient = (clientId: string) => {
    if (disabled) return;
    setPendingClientId(clientId);
    setTimerDraft((previous) => ({ ...previous, projectId: "" }));
  };
  const selectProject = (projectId: string) => {
    if (disabled) return;
    setPendingClientId("");
    setTimerDraft((previous) => ({ ...previous, projectId }));
  };
  const panel = variant === "panel";
  const fieldClass = cn("grid min-w-0 gap-2 text-xs font-bold text-[var(--text-muted)] max-[359px]:gap-1.5 max-[359px]:text-[11px]", !panel && "col-span-4 max-[720px]:col-span-12");
  const triggerClass = cn(panel && "h-12 rounded-[15px] bg-[color-mix(in_srgb,var(--surface-2)_92%,transparent)] ps-10 max-[359px]:h-11 max-[359px]:rounded-[13px] max-[359px]:ps-9");

  return (
    <div className={panel ? "grid gap-3 max-[359px]:gap-2.5" : "contents"} data-first-run-timer-relations>
      <div className={fieldClass}>
        <div className="flex items-center justify-between gap-2">
          <span>{t("common.client")}</span>
          {!disabled && <QuickClientDialog compact onCreate={createClient} onCreated={selectClient} />}
        </div>
        <div className="relative">
          {panel && <UserRound aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 z-10 size-4 -translate-y-1/2 text-[var(--text-muted)] max-[359px]:start-2.5" />}
          {activeClients.length ? (
            <Select value={selectedClientId} onValueChange={selectClient} disabled={disabled}>
              <SelectTrigger className={triggerClass}><SelectValue placeholder={t("today.relations.chooseClient")} /></SelectTrigger>
              <SelectContent>{activeClients.map((client) => <SelectItem value={client.id} key={client.id}>{client.name}</SelectItem>)}</SelectContent>
            </Select>
          ) : (
            <div className="flex min-h-12 items-center gap-2 rounded-[15px] border border-dashed border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 text-[10px] font-medium text-[var(--text-muted)] max-[359px]:min-h-11 max-[359px]:rounded-[13px] max-[359px]:px-2.5 max-[359px]:text-[9px]">
              <Users aria-hidden="true" className="size-4 shrink-0" /><span>{t("today.relations.noClientTimer")}</span>
            </div>
          )}
        </div>
      </div>
      <div className={fieldClass}>
        <div className="flex items-center justify-between gap-2">
          <span>{t("common.project")}</span>
          {!disabled && selectedClient && <QuickProjectDialog client={selectedClient} onCreate={createProject} onCreated={selectProject} label={t("today.relations.newProject")} />}
        </div>
        <div className="relative">
          {panel && <FolderKanban aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 z-10 size-4 -translate-y-1/2 text-[var(--text-muted)] max-[359px]:start-2.5" />}
          {!selectedClientId ? (
            <div className="flex min-h-12 items-center gap-2 rounded-[15px] border border-dashed border-[var(--dashboard-border)] bg-[var(--surface-2)] ps-10 pe-3 text-[10px] font-medium text-[var(--text-muted)] max-[359px]:min-h-11 max-[359px]:rounded-[13px] max-[359px]:ps-9 max-[359px]:pe-2.5 max-[359px]:text-[9px]">
              <FolderPlus aria-hidden="true" className="size-4 shrink-0" /><span>{t("today.relations.chooseClientFirst")}</span>
            </div>
          ) : availableProjects.length || currentProject ? (
            <Select value={effectiveProjectId} onValueChange={selectProject} disabled={disabled}>
              <SelectTrigger className={cn(triggerClass, disabled && "opacity-85")}><SelectValue placeholder={t("today.relations.chooseProject")} /></SelectTrigger>
              <SelectContent>{(currentProject && !availableProjects.some((project) => project.id === currentProject.id) ? [currentProject, ...availableProjects] : availableProjects).map((project) => <SelectItem value={project.id} key={project.id}>{project.name}</SelectItem>)}</SelectContent>
            </Select>
          ) : (
            <div className="flex min-h-12 items-center gap-2 rounded-[15px] border border-dashed border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 text-[10px] font-medium text-[var(--text-muted)] max-[359px]:min-h-11 max-[359px]:rounded-[13px] max-[359px]:px-2.5 max-[359px]:text-[9px]">
              <FolderPlus aria-hidden="true" className="size-4 shrink-0" /><span>{t("today.relations.noActiveProject")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
