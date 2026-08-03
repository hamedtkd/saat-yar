import type { Dispatch, SetStateAction } from "react";
import { colors, createLeaveDraft } from "@/lib/constants";
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
};

export function useBusinessActions(args: Args) {
  const { data, setData, setToast, clientDraft, setClientDraft, projectDraft, setProjectDraft, timerDraft, setTimerDraft,
    leaveDraft, setLeaveDraft, setSelectedProjectId, setShowClientForm, setShowProjectForm, activeEntry } = args;
  function toggleProjectTimer(projectId?: string) {
    if (activeEntry) {
      setData((previous) => ({ ...previous, timeEntries: previous.timeEntries.map((entry) => entry.id === activeEntry.id ? { ...entry, endedAt: new Date().toISOString() } : entry) }));
      return setToast("تایمر پروژه متوقف و ذخیره شد");
    }
    const project = data.projects.find((item) => item.id === (projectId || timerDraft.projectId));
    if (!project) return setToast("ابتدا یک پروژه انتخاب کنید");
    setData((previous) => ({ ...previous, timeEntries: [{ id: crypto.randomUUID(), clientId: project.clientId, projectId: project.id,
      task: timerDraft.task, startedAt: new Date().toISOString(), endedAt: null, note: timerDraft.note,
      billable: timerDraft.billable, effectiveRate: project.rate }, ...previous.timeEntries] }));
    setToast("تایمر پروژه شروع شد");
  }
  function addClient() {
    if (!clientDraft.name.trim()) return setToast("نام مشتری را وارد کنید");
    const id = crypto.randomUUID();
    setData((previous) => ({ ...previous, clients: [...previous.clients, { id, name: clientDraft.name.trim(), email: clientDraft.email.trim(), note: clientDraft.note.trim(), color: colors[previous.clients.length % colors.length], archived: false }] }));
    setClientDraft(initialClientDraft); setProjectDraft((previous) => ({ ...previous, clientId: previous.clientId || id }));
    setShowClientForm(false); setToast("مشتری جدید ذخیره شد");
  }
  function addProject() {
    if (!projectDraft.name.trim() || !projectDraft.clientId) return setToast("نام پروژه و مشتری الزامی است");
    const id = crypto.randomUUID();
    setData((previous) => ({ ...previous, projects: [...previous.projects, { id, clientId: projectDraft.clientId, name: projectDraft.name.trim(), rate: projectDraft.rate, budgetHours: projectDraft.budgetHours, note: projectDraft.note, color: colors[previous.projects.length % colors.length], status: "active", billable: true }] }));
    setSelectedProjectId(id); setTimerDraft((previous) => ({ ...previous, projectId: id }));
    setProjectDraft({ ...initialProjectDraft, clientId: projectDraft.clientId }); setShowProjectForm(false); setToast("پروژه ساخته شد");
  }
  function saveLeave() {
    if (leaveDraft.endDate < leaveDraft.startDate) return setToast("بازه تاریخ معتبر نیست");
    const overlap = data.leaves.some((item) => item.id !== leaveDraft.id && item.startDate <= leaveDraft.endDate && item.endDate >= leaveDraft.startDate);
    if (overlap) return setToast("این بازه با مرخصی دیگری هم‌پوشانی دارد");
    const entry = { ...leaveDraft, id: leaveDraft.id || crypto.randomUUID(), createdAt: leaveDraft.createdAt || new Date().toISOString() };
    setData((previous) => ({ ...previous, leaves: leaveDraft.id ? previous.leaves.map((item) => item.id === leaveDraft.id ? entry : item) : [entry, ...previous.leaves] }));
    setLeaveDraft(createLeaveDraft()); setToast(leaveDraft.id ? "مرخصی ویرایش شد" : "مرخصی ثبت شد");
  }
  function changeMode(mode: Mode) {
    setData((previous) => ({ ...previous, settings: { ...previous.settings, mode } }));
    setToast(`فضای کاری روی «${{ employee: "کارمند", freelancer: "فریلنسر", hybrid: "ترکیبی" }[mode]}» قرار گرفت`);
  }
  return { toggleProjectTimer, addClient, addProject, saveLeave, changeMode };
}
