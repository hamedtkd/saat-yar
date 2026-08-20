import type { WorkProject } from "./types.ts";

export const WORK_PROJECT_NAME_MAX_LENGTH = 120;

export function normalizeWorkProjectName(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, WORK_PROJECT_NAME_MAX_LENGTH);
}

export function isDuplicateWorkProjectName(projects: WorkProject[], name: string) {
  const normalized = normalizeWorkProjectName(name).toLocaleLowerCase();
  if (!normalized) return false;
  return projects.some((project) => project.name.toLocaleLowerCase() === normalized);
}

export function createWorkProject({ id, name, createdAt }: { id: string; name: string; createdAt: string }): WorkProject | undefined {
  const normalized = normalizeWorkProjectName(name);
  if (!normalized) return undefined;
  return { id, name: normalized, status: "active", createdAt };
}
