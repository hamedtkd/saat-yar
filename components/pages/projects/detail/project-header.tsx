import { ChevronRight, Pause, Play, Square } from "lucide-react";
import { SurfaceCard } from "@/components/common/surface-card";
import { Button } from "@/components/ui/button";
import type { Client, Project, TimeEntry } from "@/lib/types";

export function ProjectHeader({ project, client, activeEntry, onBack, onToggleTimer, onToggleStatus }: {
  project: Project;
  client?: Client;
  activeEntry?: TimeEntry;
  onBack: () => void;
  onToggleTimer: () => void;
  onToggleStatus: () => void;
}) {
  const isRunning = activeEntry?.projectId === project.id;

  return (
    <SurfaceCard as="section" className="mb-5 flex min-h-[118px] items-center justify-between gap-6 p-5 max-[720px]:flex-col max-[720px]:items-stretch">
      <div className="min-w-0">
        <button type="button" className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-[10px] font-bold text-[var(--accent-strong)]" onClick={onBack}>
          <ChevronRight className="size-3.5" /> همه پروژه‌ها
        </button>
        <div className="mt-3 flex items-center gap-3">
          <i className="h-10 w-2.5 shrink-0 rounded-full" style={{ background: project.color }} />
          <div className="min-w-0"><h1 className="truncate text-[clamp(1.35rem,2.4vw,2rem)] font-black text-[var(--text)]">{project.name}</h1><p className="mt-1 text-xs text-[var(--text-muted)]">کارفرما: {client?.name ?? "—"}</p></div>
        </div>
      </div>
      <div className="flex items-center gap-2 max-[720px]:w-full max-[720px]:flex-wrap">
        <Button onClick={onToggleTimer}>{isRunning ? <><Square /> پایان تایمر</> : <><Play /> شروع تایمر</>}</Button>
        <Button variant="outline" onClick={onToggleStatus}><Pause /> {project.status === "active" ? "توقف پروژه" : "فعال‌سازی"}</Button>
      </div>
    </SurfaceCard>
  );
}
