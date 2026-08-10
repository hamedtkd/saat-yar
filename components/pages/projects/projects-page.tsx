"use client";

import { FolderKanban, Plus } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { SectionHeading } from "@/components/common/section-heading";
import { useBusinessUi } from "@/components/i18n/use-business-ui";
import { Button } from "@/components/ui/button";
import type { AppData, ClientDraft, Project, ProjectDraft, TimeEntry } from "@/lib/types";
import { ProjectDetail } from "./project-detail";
import { ProjectForm } from "./project-form";
import { ProjectList } from "./project-list";

export function ProjectsPage({ data, setData, selectedProject, setSelectedProjectId, showForm, setShowForm, draft, setDraft, addProject, createClient, activeEntry, toggleProjectTimer, financialsHidden }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  selectedProject?: Project;
  setSelectedProjectId: (id: string) => void;
  showForm: boolean;
  setShowForm: (value: boolean) => void;
  draft: ProjectDraft;
  setDraft: React.Dispatch<React.SetStateAction<ProjectDraft>>;
  addProject: () => void;
  createClient: (draft: ClientDraft) => string | undefined;
  activeEntry?: TimeEntry;
  toggleProjectTimer: (id?: string) => void;
  financialsHidden: boolean;
}) {
  const { b } = useBusinessUi();
  if (selectedProject) {
    return <ProjectDetail data={data} setData={setData} project={selectedProject} activeEntry={activeEntry} onBack={() => setSelectedProjectId("")} onToggleTimer={toggleProjectTimer} financialsHidden={financialsHidden} />;
  }

  return (
    <>
      <PageHeading title={b("projects.title")} description={b("projects.description")}>
        <Button onClick={() => setShowForm(!showForm)}><Plus /> {b("projects.new")}</Button>
      </PageHeading>
      {showForm && <ProjectForm data={data} draft={draft} setDraft={setDraft} createClient={createClient} onSave={addProject} onCancel={() => setShowForm(false)} />}
      <SectionHeading icon={<FolderKanban />} eyebrow={b("projects.section.eyebrow")} title={b("projects.section.title")} description={b("projects.section.description")} />
      <ProjectList data={data} financialsHidden={financialsHidden} onSelect={setSelectedProjectId} onCreate={() => setShowForm(true)} />
    </>
  );
}
