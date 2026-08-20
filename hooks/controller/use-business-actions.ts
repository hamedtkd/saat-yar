import type { Dispatch, SetStateAction } from "react";
import { colors, createLeaveDraft } from "@/lib/constants";
import { getBrowserLocale, translate } from "@/lib/i18n";
import { translateBusiness } from "@/lib/i18n/business";
import type { AppData, ClientDraft, LeaveEntry, Mode, ProjectDraft, TimerDraft } from "@/lib/types";
import { projectTimerSegmentSeconds, readProjectTimerSession, type ProjectTimerSession } from "@/lib/project-timer-session";
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
  projectTimerSession: ProjectTimerSession | null;
  setProjectTimerSession: (session: ProjectTimerSession | null) => void;
  ensureLiveTimerOwnership: () => boolean;
};

export function useBusinessActions(args: Args) {
  const { data, setData, setToast, clientDraft, setClientDraft, projectDraft, setProjectDraft, timerDraft, setTimerDraft,
    leaveDraft, setLeaveDraft, setSelectedProjectId, setShowClientForm, setShowProjectForm, activeEntry, projectTimerSession, setProjectTimerSession, ensureLiveTimerOwnership } = args;
  const readStoredTimerSession = () => {
    try { return readProjectTimerSession(typeof window === "undefined" ? undefined : window.localStorage); }
    catch { return null; }
  };
  function startProjectTimer(projectId?: string) {
    if (activeEntry || projectTimerSession || readStoredTimerSession()) return;
    if (!ensureLiveTimerOwnership()) return setToast(translateBusiness(getBrowserLocale(), "toast.timerOtherTab"));
    const project = data.projects.find((item) => item.id === (projectId || timerDraft.projectId));
    if (!project) return setToast(translateBusiness(getBrowserLocale(), "toast.selectProject"));
    const startedAt = new Date().toISOString();
    const id = crypto.randomUUID();
    const entry = { id, clientId: project.clientId, projectId: project.id,
      task: timerDraft.task, startedAt, endedAt: null, note: timerDraft.note,
      billable: timerDraft.billable, effectiveRate: project.rate };
    setData((previous) => ({ ...previous, timeEntries: [entry, ...previous.timeEntries] }));
    setProjectTimerSession({
      version: 1, phase: "running", sessionStartedAt: startedAt, activeEntryId: id, segmentStartedAt: startedAt,
      accumulatedSeconds: 0, clientId: project.clientId, projectId: project.id, task: timerDraft.task,
      note: timerDraft.note, billable: timerDraft.billable, effectiveRate: project.rate,
    });
    setToast(translateBusiness(getBrowserLocale(), "toast.timerStarted"));
  }

  function pauseProjectTimer() {
    const currentSession = readStoredTimerSession() ?? projectTimerSession;
    if (!activeEntry || currentSession?.phase === "paused") return;
    if (!ensureLiveTimerOwnership()) return setToast(translateBusiness(getBrowserLocale(), "toast.timerOtherTab"));
    const pausedAt = new Date().toISOString();
    const base = currentSession?.accumulatedSeconds ?? 0;
    const accumulatedSeconds = base + projectTimerSegmentSeconds(activeEntry.startedAt, pausedAt);
    setData((previous) => ({ ...previous, timeEntries: previous.timeEntries.map((entry) =>
      entry.id === activeEntry.id && !entry.endedAt ? { ...entry, endedAt: pausedAt } : entry) }));
    setProjectTimerSession({
      version: 1, phase: "paused", sessionStartedAt: currentSession?.sessionStartedAt ?? activeEntry.startedAt,
      activeEntryId: activeEntry.id, pausedAt, accumulatedSeconds, clientId: activeEntry.clientId, projectId: activeEntry.projectId,
      task: activeEntry.task ?? "", note: activeEntry.note, billable: activeEntry.billable, effectiveRate: activeEntry.effectiveRate,
    });
    setToast(translateBusiness(getBrowserLocale(), "toast.timerPaused"));
  }

  function resumeProjectTimer() {
    const pausedSession = readStoredTimerSession() ?? projectTimerSession;
    if (pausedSession?.phase !== "paused") return;
    if (!ensureLiveTimerOwnership()) return setToast(translateBusiness(getBrowserLocale(), "toast.timerOtherTab"));
    const startedAt = new Date().toISOString();
    const id = crypto.randomUUID();
    const entry = { id, clientId: pausedSession.clientId, projectId: pausedSession.projectId,
      task: pausedSession.task, startedAt, endedAt: null, note: pausedSession.note,
      billable: pausedSession.billable, effectiveRate: pausedSession.effectiveRate };
    setData((previous) => {
      const normalizedEntries = previous.timeEntries.map((item) =>
        pausedSession.activeEntryId && pausedSession.pausedAt && item.id === pausedSession.activeEntryId && !item.endedAt
          ? { ...item, endedAt: pausedSession.pausedAt }
          : item);
      return { ...previous, timeEntries: [entry, ...normalizedEntries] };
    });
    setProjectTimerSession({ ...pausedSession, phase: "running", activeEntryId: id, segmentStartedAt: startedAt, pausedAt: undefined });
    setToast(translateBusiness(getBrowserLocale(), "toast.timerResumed"));
  }

  function finishProjectTimer() {
    if (!activeEntry && !projectTimerSession) return;
    if (!ensureLiveTimerOwnership()) return setToast(translateBusiness(getBrowserLocale(), "toast.timerOtherTab"));
    if (activeEntry) {
      const currentSession = readStoredTimerSession() ?? projectTimerSession;
      const endedAt = currentSession?.phase === "paused" && currentSession.pausedAt ? currentSession.pausedAt : new Date().toISOString();
      setData((previous) => ({ ...previous, timeEntries: previous.timeEntries.map((entry) =>
        entry.id === activeEntry.id && !entry.endedAt ? { ...entry, endedAt } : entry) }));
    }
    setProjectTimerSession(null);
    setToast(translateBusiness(getBrowserLocale(), "toast.timerStopped"));
  }

  function updateProjectTimerDetails(patch: Partial<Pick<AppData["timeEntries"][number], "task" | "note" | "billable">>) {
    setTimerDraft((previous) => ({ ...previous, ...patch }));
    if (activeEntry) {
      setData((previous) => ({ ...previous, timeEntries: previous.timeEntries.map((entry) =>
        entry.id === activeEntry.id ? { ...entry, ...patch } : entry) }));
    }
    if (projectTimerSession) setProjectTimerSession({ ...projectTimerSession, ...patch });
  }

  function toggleProjectTimer(projectId?: string) {
    if (projectTimerSession?.phase === "paused") {
      if (!projectId || projectId === projectTimerSession.projectId) return resumeProjectTimer();
      return setToast(translateBusiness(getBrowserLocale(), "toast.finishPausedTimerFirst"));
    }
    if (activeEntry) return finishProjectTimer();
    return startProjectTimer(projectId);
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
  return { toggleProjectTimer, startProjectTimer, pauseProjectTimer, resumeProjectTimer, finishProjectTimer, updateProjectTimerDetails, createClient, addClient, createProject, addProject, saveLeave, changeMode };
}
