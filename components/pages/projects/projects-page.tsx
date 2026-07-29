import { Plus } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { Button } from "@/components/ui/button";
import type { AppData, Project, ProjectDraft, TimeEntry } from "@/lib/types";
import { ProjectDetail } from "./project-detail";
import { ProjectForm } from "./project-form";
import { ProjectList } from "./project-list";

export function ProjectsPage({ data, setData, selectedProject, setSelectedProjectId, showForm, setShowForm, draft, setDraft, addProject, activeEntry, toggleProjectTimer }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  selectedProject?: Project;
  setSelectedProjectId: (id: string) => void;
  showForm: boolean;
  setShowForm: (value: boolean) => void;
  draft: ProjectDraft;
  setDraft: React.Dispatch<React.SetStateAction<ProjectDraft>>;
  addProject: () => void;
  activeEntry?: TimeEntry;
  toggleProjectTimer: (id?: string) => void;
}) {
  if (selectedProject) return <ProjectDetail data={data} setData={setData} project={selectedProject} activeEntry={activeEntry} onBack={() => setSelectedProjectId("")} onToggleTimer={toggleProjectTimer} />;
  return <><PageHeading title="پروژه‌ها" description="بودجه، نرخ و زمان هر پروژه را یک‌جا ببین."><Button onClick={() => setShowForm(!showForm)}><Plus /> پروژه جدید</Button></PageHeading>{showForm && <ProjectForm data={data} draft={draft} setDraft={setDraft} onSave={addProject} onCancel={() => setShowForm(false)} />}<ProjectList data={data} onSelect={setSelectedProjectId} onCreate={() => setShowForm(true)} /></>;
}
