import { ChevronLeft, Folder, Plus } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { duration, entryMinutes, fa, money } from "@/lib/format";
import type { AppData } from "@/lib/types";
import { cn } from "@/lib/cn";

export function ProjectList({ data, onSelect, onCreate, financialsHidden }: { data: AppData; onSelect: (id: string) => void; onCreate: () => void; financialsHidden: boolean }) {
  return (
    <section className={cn("grid grid-cols-3 gap-[14px] max-[1180px]:grid-cols-2 max-[620px]:grid-cols-1")}>
      {data.projects.map((project) => {
        const entries = data.timeEntries.filter((entry) => entry.projectId === project.id);
        const minutes = entries.reduce((sum, entry) => sum + entryMinutes(entry), 0);
        const progress = Math.min(100, Math.round(minutes / Math.max(1, (project.budgetHours ?? 0) * 60) * 100));
        return <article className={cn("rounded-[15px] border border-[#dfe7e9] bg-white/95 shadow-[0_10px_35px_rgba(17,45,55,.055)] p-[18px] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(17,45,55,.09)]")} key={project.id} onClick={() => onSelect(project.id)}><div className={cn("grid grid-cols-[10px_1fr_auto] items-center gap-[10px] [&>span:first-child]:h-9 [&>span:first-child]:w-[10px] [&>span:first-child]:rounded-lg [&>div]:grid [&_strong]:text-[15px] [&_small]:text-[10px] [&_small]:text-[#6c7d89]")}><span style={{ background: project.color }} /><div><strong>{project.name}</strong><small>{data.clients.find((client) => client.id === project.clientId)?.name}</small></div><StatusBadge success={project.status === "active"}>{project.status === "active" ? "فعال" : project.status === "paused" ? "متوقف" : "تکمیل"}</StatusBadge></div><div className={cn("my-5 grid grid-cols-2 gap-[10px] [&_span]:grid [&_span]:gap-[5px] [&_span]:rounded-[10px] [&_span]:bg-[#f8fbfa] [&_span]:p-[11px] [&_span]:text-[10px] [&_span]:text-[#6c7d89] [&_strong]:text-base [&_strong]:text-[#102a3a]")}><span>زمان ثبت‌شده<strong>{duration(minutes)}</strong></span><span>نرخ ساعتی<strong>{financialsHidden ? "••••••" : money(project.rate)}</strong></span></div><div className={cn("mb-4 [&>div]:flex [&>div]:justify-between [&>div]:text-[10px] [&>i]:my-2 [&>i]:block [&>i]:h-[7px] [&>i]:overflow-hidden [&>i]:rounded-[10px] [&>i]:bg-[#e8edef] [&>i>b]:block [&>i>b]:h-full [&>i>b]:rounded-[inherit] [&>i>b]:bg-[#079b60]")}><div><span>مصرف بودجه</span><b>{fa.format(progress)}٪</b></div><i><b style={{ width: `${progress}%` }} /></i></div><Button variant="outline" className={cn("w-full")}>مشاهده جزئیات <ChevronLeft /></Button></article>;
      })}
      {data.projects.length === 0 && <article className={cn("rounded-[15px] border border-[#dfe7e9] bg-white/95 shadow-[0_10px_35px_rgba(17,45,55,.055)] p-4", "grid min-h-[145px] place-content-center justify-items-center gap-[5px] text-center text-[#6c7d89] [&_svg]:h-8 [&_svg]:w-8 [&_svg]:text-[#a9b8be] [&_strong]:text-[#102a3a] [&_span]:text-[10px]", "col-span-full min-h-[290px]")}><EmptyState large icon={<Folder />} title="اولین پروژه‌ات را بساز" description="پروژه را به مشتری متصل کن، بودجه و نرخ را مشخص کن و تایمر را شروع کن."><Button onClick={onCreate}><Plus /> پروژه جدید</Button></EmptyState></article>}
    </section>
  );
}
