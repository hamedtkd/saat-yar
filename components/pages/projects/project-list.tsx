import { ChevronLeft, Folder, Plus } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { duration, entryMinutes, fa, money } from "@/lib/format";
import { tw } from "@/lib/tw";
import type { AppData } from "@/lib/types";

export function ProjectList({ data, onSelect, onCreate }: { data: AppData; onSelect: (id: string) => void; onCreate: () => void }) {
  return (
    <section className={tw("project-cards")}>
      {data.projects.map((project) => {
        const entries = data.timeEntries.filter((entry) => entry.projectId === project.id);
        const minutes = entries.reduce((sum, entry) => sum + entryMinutes(entry), 0);
        const progress = Math.min(100, Math.round(minutes / Math.max(1, (project.budgetHours ?? 0) * 60) * 100));
        return <article className={tw("project-card")} key={project.id} onClick={() => onSelect(project.id)}><div className={tw("project-card-head")}><span style={{ background: project.color }} /><div><strong>{project.name}</strong><small>{data.clients.find((client) => client.id === project.clientId)?.name}</small></div><StatusBadge success={project.status === "active"}>{project.status === "active" ? "فعال" : project.status === "paused" ? "متوقف" : "تکمیل"}</StatusBadge></div><div className={tw("project-card-stats")}><span>زمان ثبت‌شده<strong>{duration(minutes)}</strong></span><span>نرخ ساعتی<strong>{money(project.rate)}</strong></span></div><div className={tw("budget-line")}><div><span>مصرف بودجه</span><b>{fa.format(progress)}٪</b></div><i><b style={{ width: `${progress}%` }} /></i></div><Button variant="outline" className={tw("full")}>مشاهده جزئیات <ChevronLeft /></Button></article>;
      })}
      {data.projects.length === 0 && <article className={tw("panel", "empty-state", "large")}><EmptyState large icon={<Folder />} title="اولین پروژه‌ات را بساز" description="پروژه را به مشتری متصل کن، بودجه و نرخ را مشخص کن و تایمر را شروع کن."><Button onClick={onCreate}><Plus /> پروژه جدید</Button></EmptyState></article>}
    </section>
  );
}
