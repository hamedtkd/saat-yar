import { FolderKanban, Plus } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { SectionHeading } from "@/components/common/section-heading";
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
  if (selectedProject) {
    return <ProjectDetail data={data} setData={setData} project={selectedProject} activeEntry={activeEntry} onBack={() => setSelectedProjectId("")} onToggleTimer={toggleProjectTimer} financialsHidden={financialsHidden} />;
  }

  return (
    <>
      <PageHeading title="پروژه‌ها" description="بودجه، نرخ، زمان و وضعیت هر پروژه را بدون از دست دادن جزئیات دنبال کن.">
        <Button onClick={() => setShowForm(!showForm)}><Plus /> پروژه جدید</Button>
      </PageHeading>
      {showForm && <ProjectForm data={data} draft={draft} setDraft={setDraft} createClient={createClient} onSave={addProject} onCancel={() => setShowForm(false)} />}
      <SectionHeading icon={<FolderKanban />} eyebrow="پرتفوی پروژه" title="پروژه‌های شما" description="وضعیت، مصرف بودجه و سود هر پروژه را در کارت‌های یکپارچه مرور کن." />
      <ProjectList data={data} financialsHidden={financialsHidden} onSelect={setSelectedProjectId} onCreate={() => setShowForm(true)} />
    </>
  );
}
