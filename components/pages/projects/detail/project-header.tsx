import { ChevronRight, Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Client, Project, TimeEntry } from "@/lib/types";
import { cn } from "@/lib/cn";

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
    <section className={cn(
      "mb-[22px] flex min-h-24 items-start justify-between gap-6 max-[620px]:mb-[17px] max-[620px]:min-h-0 max-[620px]:flex-col",
      "[&_h1]:mt-2 [&_h1]:flex [&_h1]:items-center [&_h1]:gap-2.5 [&_h1]:text-[clamp(26px,2.4vw,36px)] [&_p]:text-[13px] [&_p]:text-[var(--text-muted)]",
    )}>
      <div className="min-w-0">
        <button type="button" className="flex items-center gap-1 bg-transparent p-0 text-[var(--accent-strong)]" onClick={onBack}>
          <ChevronRight /> همه پروژه‌ها
        </button>
        <h1><i className="h-[35px] w-3 rounded-[7px]" style={{ background: project.color }} />{project.name}</h1>
        <p>کارفرما: {client?.name ?? "—"}</p>
      </div>
      <div className="flex items-center gap-2 max-[620px]:w-full max-[620px]:flex-wrap">
        <Button onClick={onToggleTimer}>{isRunning ? <><Square /> پایان تایمر</> : <><Play /> شروع تایمر</>}</Button>
        <Button variant="outline" onClick={onToggleStatus}><Pause /> {project.status === "active" ? "توقف پروژه" : "فعال‌سازی"}</Button>
      </div>
    </section>
  );
}
