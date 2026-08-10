import type { Dispatch, SetStateAction } from "react";
import { colors, createLeaveDraft } from "@/lib/constants";
import { getBrowserLocale, translate } from "@/lib/i18n";
import { translateBusiness } from "@/lib/i18n/business";
import type { AppData, ClientDraft, LeaveEntry, Mode, ProjectDraft, TimerDraft } from "@/lib/types";
import { initialClientDraft, initialProjectDraft } from "./defaults";

type Args = {
  data: AppData; setData: Dispatch<SetStateAction<AppData>>; setToast: (message: string) => void;
  clientDraft: ClientDraft; setClientDraft: Dispatch<SetStateAction<ClientDraft>>;
  projectDraft: ProjectDraft; setProjectDraft: Dispatch<SetStateAction<ProjectDraft>>;
  timerDraft: TimerDraft; setTimerDraft: Dispatch<SetStateAction<TimerDraft>>;
  leaveDraft: LeaveEntry; setLeaveDraft: Dispatch<SetStateAction<LeaveEntry>>;
  setSelectedProjectId: Dispatch<SetStateAction<string>>;
  setShowClientForm: Dispatch<SetStateAction<boolean>>; setShowProjectForm: Dispatch<SetStateAction<boolean>>;
  activeEntry?: AppData["timeEntries"][number];
  ensureLiveTimerOwnership: () => boolean;
};

export function useBusinessActions(args: Args) {
  const { data, setData, setToast, clientDraft, setClientDraft, projectDraft, setProjectDraft, timerDraft, setTimerDraft,
    leaveDraft, setLeaveDraft, setSelectedProjectId, setShowClientForm, setShowProjectForm, activeEntry, ensureLiveTimerOwnership } = args;
  function toggleProjectTimer(projectId?: string) {
    if (!ensureLiveTimerOwnership()) return setToast(translateBusiness(getBrowserLocale(), "toast.timerOtherTab"));
    if (activeEntry) {
      setData((previous) => ({ ...previous, timeEntries: previous.timeEntries.map((entry) => entry.id === activeEntry.id ? { ...entry, endedAt: new Date().toISOString() } : entry) }));
      return setToast(translateBusiness(getBrowserLocale(), "toast.timerStopped"));
    }
    const project = data.projects.find((item) => item.id === (projectId || timerDraft.projectId));
    if (!project) return setToast(translateBusiness(getBrowserLocale(), "toast.selectProject"));
    setData((previous) => ({ ...previous, timeEntries: [{ id: crypto.randomUUID(), clientId: project.clientId, projectId: project.id,
      task: timerDraft.task, startedAt: new Date().toISOString(), endedAt: null, note: timerDraft.note,
      billable: timerDraft.billable, effectiveRate: project.rate }, ...previous.timeEntries] }));
    setToast(translateBusiness(getBrowserLocale(), "toast.timerStarted"));
  }
  function createClient(draft: ClientDraft, selectForProject: "never" | "if-empty" | "always" = "never") {
    if (!draft.name.trim()) { setToast(translateBusiness(getBrowserLocale(), "toast.clientName")); return undefined; }
    const id = crypto.randomUUID();
    setData((previous) => ({ ...previous, clients: [...previous.clients, {
      id, name: draft.name.trim(), email: draft.email.trim(), note: draft.note.trim(),
      color: colors[previous.clients.length % colors.length], archived: false,
    }] }));
    if (selectForProject !== "never") {
      setProjectDraft((previous) => ({
        ...previous,
        clientId: selectForProject === "always" ? id : previous.clientId || id,
      }));
    }
    setToast(translateBusiness(getBrowserLocale(), "toast.clientSaved"));
    return id;
  }
  function addClient() {
    const id = createClient(clientDraft, "if-empty");
    if (!id) return;
    setClientDraft(initialClientDraft); setShowClientForm(false);
  }
  function createProject(draft: ProjectDraft, selectAfterCreate = false) {
    if (!draft.name.trim() || !draft.clientId) { setToast(translateBusiness(getBrowserLocale(), "toast.projectRequired")); return undefined; }
    const id = crypto.randomUUID();
    setData((previous) => ({ ...previous, projects: [...previous.projects, {
      id, clientId: draft.clientId, name: draft.name.trim(), rate: draft.rate, budgetHours: draft.budgetHours,
      note: draft.note, color: colors[previous.projects.length % colors.length], status: "active", billable: true,
    }] }));
    if (selectAfterCreate) {
      setSelectedProjectId(id);
      setTimerDraft((previous) => ({ ...previous, projectId: id }));
    }
    setToast(translateBusiness(getBrowserLocale(), "toast.projectSaved"));
    return id;
  }
  function addProject() {
    const id = createProject(projectDraft, true);
    if (!id) return;
    setProjectDraft({ ...initialProjectDraft, clientId: projectDraft.clientId }); setShowProjectForm(false);
  }
  function saveLeave() {
    if (leaveDraft.endDate < leaveDraft.startDate) return setToast(translateBusiness(getBrowserLocale(), "toast.leaveRange"));
    const overlap = data.leaves.some((item) => item.id !== leaveDraft.id && item.startDate <= leaveDraft.endDate && item.endDate >= leaveDraft.startDate);
    if (overlap) return setToast(translateBusiness(getBrowserLocale(), "toast.leaveOverlap"));
    const entry = { ...leaveDraft, id: leaveDraft.id || crypto.randomUUID(), createdAt: leaveDraft.createdAt || new Date().toISOString() };
    setData((previous) => ({ ...previous, leaves: leaveDraft.id ? previous.leaves.map((item) => item.id === leaveDraft.id ? entry : item) : [entry, ...previous.leaves] }));
    setLeaveDraft(createLeaveDraft()); setToast(translateBusiness(getBrowserLocale(), leaveDraft.id ? "toast.leaveEdited" : "toast.leaveSaved"));
  }
  function changeMode(mode: Mode) {
    setData((previous) => ({ ...previous, settings: { ...previous.settings, mode } }));
    const locale = getBrowserLocale();
    const modeLabel = translate(locale, mode === "employee" ? "mode.employee" : mode === "freelancer" ? "mode.freelancer" : "mode.hybrid");
    setToast(translateBusiness(locale, "toast.workspaceMode", { mode: modeLabel }));
  }
  return { toggleProjectTimer, createClient, addClient, createProject, addProject, saveLeave, changeMode };
}
