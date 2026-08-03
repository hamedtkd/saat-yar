import type { ClientDraft, ProjectDraft, ReportFilter, TimerDraft } from "@/lib/types";

export const initialTimerDraft: TimerDraft = { projectId: "", task: "", note: "", billable: true };
export const initialClientDraft: ClientDraft = { name: "", email: "", note: "" };
export const initialProjectDraft: ProjectDraft = { name: "", clientId: "", rate: 850_000, budgetHours: 60, note: "" };
export const initialFilters: ReportFilter = {
  clientId: "all", projectId: "all", billable: "all", query: "", dateFrom: "", dateTo: "", status: "all",
};
