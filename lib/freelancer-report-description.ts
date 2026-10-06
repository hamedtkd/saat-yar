import type { TimeEntry } from "./types.ts";

/** The description shown for a freelancer time entry in Reports. */
export function getFreelancerReportDescription(entry: Pick<TimeEntry, "note" | "task">) {
  return entry.note || entry.task || "";
}
