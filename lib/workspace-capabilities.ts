import type { Mode } from "./types.ts";

export function getTodayWorkspaceCapabilities(mode: Mode) {
  return {
    attendance: mode !== "freelancer",
    projectTimer: mode !== "employee",
    activitySegments: mode !== "freelancer",
  } as const;
}
