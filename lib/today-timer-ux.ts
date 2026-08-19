import type { TimeEntry } from "./types";

export type RecentProjectTimerAction = "start" | "running" | "paused" | "blocked";

export function resolveRecentProjectTimerAction(
  projectId: string,
  activeProjectId?: string,
  phase?: "running" | "paused",
): RecentProjectTimerAction {
  if (!activeProjectId || !phase) return "start";
  if (activeProjectId !== projectId) return "blocked";
  return phase;
}

export type TimeEntryBoundaryUpdate =
  | { ok: true; entry: TimeEntry }
  | { ok: false; reason: "active-end" | "invalid-range" };

export function updateTimeEntryBoundary(
  entry: TimeEntry,
  boundary: "start" | "end",
  value: string,
): TimeEntryBoundaryUpdate {
  if (boundary === "end" && !entry.endedAt) return { ok: false, reason: "active-end" };

  const startedAt = boundary === "start" ? value : entry.startedAt;
  const endedAt = boundary === "end" ? value : entry.endedAt;
  const startMs = new Date(startedAt).getTime();
  const endMs = endedAt ? new Date(endedAt).getTime() : Number.POSITIVE_INFINITY;

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
    return { ok: false, reason: "invalid-range" };
  }

  return {
    ok: true,
    entry: boundary === "start" ? { ...entry, startedAt } : { ...entry, endedAt: value },
  };
}

export function normalizedTrendPercent(minutes: number, maxMinutes: number) {
  if (minutes <= 0 || maxMinutes <= 0) return 0;
  return Math.max(8, Math.min(100, Math.round(minutes / maxMinutes * 100)));
}

export function projectTimerDisplayParts(seconds: number) {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0));
  return [
    String(Math.floor(safe / 3600)).padStart(2, "0"),
    String(Math.floor(safe / 60) % 60).padStart(2, "0"),
    String(safe % 60).padStart(2, "0"),
  ] as const;
}
