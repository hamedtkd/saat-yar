import { colors } from "./constants.ts";
import type { AppData } from "./types.ts";

export type OnboardingClientInput = {
  name: string;
  email?: string;
};

export type OnboardingProjectInput = {
  clientId: string;
  name: string;
  rate: number;
  budgetHours?: number;
};

function compact(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function sameName(a: string, b: string) {
  return compact(a).toLocaleLowerCase("fa-IR") === compact(b).toLocaleLowerCase("fa-IR");
}

export function addOnboardingClient(
  data: AppData,
  input: OnboardingClientInput,
  createId: () => string = () => crypto.randomUUID(),
) {
  const name = compact(input.name);
  if (!name) return { data, clientId: "", created: false };

  const existing = data.clients.find((client) => !client.archived && sameName(client.name, name));
  if (existing) return { data, clientId: existing.id, created: false };

  const clientId = createId();
  const client = {
    id: clientId,
    name,
    email: compact(input.email ?? ""),
    color: colors[data.clients.length % colors.length],
    archived: false,
  };
  return { data: { ...data, clients: [...data.clients, client] }, clientId, created: true };
}

export function addOnboardingProject(
  data: AppData,
  input: OnboardingProjectInput,
  createId: () => string = () => crypto.randomUUID(),
) {
  const name = compact(input.name);
  if (!name || !input.clientId || !data.clients.some((client) => client.id === input.clientId)) {
    return { data, projectId: "", created: false };
  }

  const existing = data.projects.find((project) => project.clientId === input.clientId && sameName(project.name, name));
  if (existing) return { data, projectId: existing.id, created: false };

  const projectId = createId();
  const project = {
    id: projectId,
    clientId: input.clientId,
    name,
    rate: Math.max(0, Math.round(input.rate || 0)),
    budgetHours: Math.max(0, Number(input.budgetHours || 0)),
    color: colors[data.projects.length % colors.length],
    status: "active" as const,
    billable: true,
  };
  return { data: { ...data, projects: [...data.projects, project] }, projectId, created: true };
}

export function addOnboardingWorkspace(
  data: AppData,
  input: { clientName: string; projectName: string; rate: number; budgetHours?: number },
  createId: () => string = () => crypto.randomUUID(),
) {
  const clientResult = addOnboardingClient(data, { name: input.clientName }, createId);
  if (!clientResult.clientId || !compact(input.projectName)) {
    return { data: clientResult.data, clientId: clientResult.clientId, projectId: "", clientCreated: clientResult.created, projectCreated: false };
  }
  const projectResult = addOnboardingProject(clientResult.data, {
    clientId: clientResult.clientId,
    name: input.projectName,
    rate: input.rate,
    budgetHours: input.budgetHours,
  }, createId);
  return {
    data: projectResult.data,
    clientId: clientResult.clientId,
    projectId: projectResult.projectId,
    clientCreated: clientResult.created,
    projectCreated: projectResult.created,
  };
}
