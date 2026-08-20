import type { ActivityProjectContext, ActivitySegment, Mode, Project, WorkProject } from "./types.ts";

export type ActivityProjectOption = ActivityProjectContext & { name: string };

export function getActivityProjectOptions(mode: Mode, workProjects: WorkProject[], freelanceProjects: Project[]): ActivityProjectOption[] {
  const work = workProjects
    .filter((project) => project.status === "active")
    .map((project) => ({ source: "work" as const, id: project.id, name: project.name }));
  if (mode !== "hybrid") return work;
  const freelance = freelanceProjects
    .filter((project) => project.status === "active")
    .map((project) => ({ source: "freelance" as const, id: project.id, name: project.name }));
  return [...work, ...freelance];
}

export function resolveActivityProjectName(segment: ActivitySegment, mode: Mode, workProjects: WorkProject[], freelanceProjects: Project[]) {
  if (segment.workProjectId) return workProjects.find((project) => project.id === segment.workProjectId)?.name;
  if (mode === "hybrid" && segment.projectId) return freelanceProjects.find((project) => project.id === segment.projectId)?.name;
  return undefined;
}
