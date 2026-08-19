"use client";

import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { getActivityProjectOptions } from "@/lib/activity-project-context";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ActivityProjectContext, Mode, Project, WorkProject } from "@/lib/types";
import { QuickWorkProjectDialog } from "./quick-work-project-dialog";

const NO_PROJECT = "__none__";
const EMPTY_WORK_PROJECT = "__empty_work_project__";

function encode(context?: ActivityProjectContext) {
  return context ? `${context.source}:${context.id}` : NO_PROJECT;
}

function decode(value: string): ActivityProjectContext | undefined {
  if (value === NO_PROJECT) return undefined;
  const [source, ...rest] = value.split(":");
  const id = rest.join(":");
  if (!id || (source !== "work" && source !== "freelance")) return undefined;
  return { source, id };
}

export function ActivityProjectField({ mode, value, workProjects, freelanceProjects, onChange, onCreateWorkProject }: {
  mode: Mode;
  value?: ActivityProjectContext;
  workProjects: WorkProject[];
  freelanceProjects: Project[];
  onChange: (value?: ActivityProjectContext) => void;
  onCreateWorkProject: (name: string) => string | undefined;
}) {
  const { t } = useLocaleUi();
  const options = getActivityProjectOptions(mode, workProjects, freelanceProjects);
  const activeWorkProjects = options.filter((project) => project.source === "work");
  const activeFreelanceProjects = options.filter((project) => project.source === "freelance");
  const showFreelance = mode === "hybrid";
  const label = showFreelance ? t("activity.today.projectContext") : t("activity.today.workProject");

  return (
    <div className="grid min-w-0 content-start gap-1.5">
      <div className="flex min-h-5 items-center text-[11px] font-black text-[var(--text)]">
        <span className="inline-flex items-center gap-1 whitespace-nowrap">
          <span>{label}</span>
          <small className="text-[9px] font-medium text-[var(--text-muted)]">({t("common.optional")})</small>
        </span>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <Select value={encode(value)} onValueChange={(next) => onChange(decode(next))}>
          <SelectTrigger data-activity-project className="min-w-0 flex-1"><SelectValue placeholder={t("activity.today.noProject")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_PROJECT}>{t("activity.today.noProject")}</SelectItem>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>{t("activity.today.workProjects")}</SelectLabel>
              {activeWorkProjects.length
                ? activeWorkProjects.map((project) => <SelectItem key={project.id} value={`work:${project.id}`}>{project.name}</SelectItem>)
                : <SelectItem value={EMPTY_WORK_PROJECT} disabled>{t("activity.today.noWorkProjects")}</SelectItem>}
            </SelectGroup>
            {showFreelance && activeFreelanceProjects.length > 0 && (
              <>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>{t("activity.today.freelanceProjects")}</SelectLabel>
                  {activeFreelanceProjects.map((project) => <SelectItem key={project.id} value={`freelance:${project.id}`}>{project.name}</SelectItem>)}
                </SelectGroup>
              </>
            )}
          </SelectContent>
        </Select>
        <QuickWorkProjectDialog onCreate={onCreateWorkProject} onCreated={(id) => onChange({ source: "work", id })} />
      </div>
    </div>
  );
}
