import { ChevronLeft, Folder, Plus, TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { duration, fa, money } from "@/lib/format";
import { getProjectFinanceSummary } from "@/lib/project-finance";
import type { AppData } from "@/lib/types";
import { cn } from "@/lib/cn";

export function ProjectList({ data, onSelect, onCreate, financialsHidden }: { data: AppData; onSelect: (id: string) => void; onCreate: () => void; financialsHidden: boolean }) {
  return (
    <section className="grid grid-cols-3 gap-[14px] max-[1180px]:grid-cols-2 max-[620px]:grid-cols-1">
      {data.projects.map((project) => {
        const summary = getProjectFinanceSummary(project, data.timeEntries, data.expenses);
        return <article className="rounded-[15px] border border-[#dfe7e9] bg-white/95 p-[18px] shadow-[0_10px_35px_rgba(17,45,55,.055)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(17,45,55,.09)]" key={project.id} onClick={() => onSelect(project.id)}>
          <div className="grid grid-cols-[10px_1fr_auto] items-center gap-[10px] [&>span:first-child]:h-9 [&>span:first-child]:w-[10px] [&>span:first-child]:rounded-lg [&>div]:grid [&_strong]:text-[15px] [&_small]:text-[10px] [&_small]:text-[#6c7d89]"><span style={{ background: project.color }} /><div><strong>{project.name}</strong><small>{data.clients.find((client) => client.id === project.clientId)?.name}</small></div><StatusBadge success={project.status === "active"}>{project.status === "active" ? "فعال" : project.status === "paused" ? "متوقف" : "تکمیل"}</StatusBadge></div>
          {summary.budgetStatus !== "healthy" && summary.budgetStatus !== "none" && <div className={cn("mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-[10px]", summary.budgetStatus === "exceeded" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700")}><TriangleAlert className="h-4 w-4" />{summary.budgetStatus === "exceeded" ? "بودجه زمانی تمام شده" : "بودجه به ۸۰٪ رسیده"}</div>}
          <div className="my-5 grid grid-cols-2 gap-[10px] [&_span]:grid [&_span]:gap-[5px] [&_span]:rounded-[10px] [&_span]:bg-[#f8fbfa] [&_span]:p-[11px] [&_span]:text-[10px] [&_span]:text-[#6c7d89] [&_strong]:text-base [&_strong]:text-[#102a3a]"><span>زمان ثبت‌شده<strong>{duration(summary.trackedMinutes)}</strong></span><span>سود خالص<strong>{financialsHidden ? "••••••" : money(summary.profit)}</strong></span></div>
          <div className="mb-4 [&>div]:flex [&>div]:justify-between [&>div]:text-[10px] [&>i]:my-2 [&>i]:block [&>i]:h-[7px] [&>i]:overflow-hidden [&>i]:rounded-[10px] [&>i]:bg-[#e8edef] [&>i>b]:block [&>i>b]:h-full [&>i>b]:rounded-[inherit]"><div><span>مصرف بودجه</span><b>{fa.format(summary.budgetProgress)}٪</b></div><i><b className={summary.budgetStatus === "exceeded" ? "bg-red-500" : summary.budgetStatus === "warning" ? "bg-amber-500" : "bg-[#079b60]"} style={{ width: `${Math.min(100, summary.budgetProgress)}%` }} /></i></div>
          <Button variant="outline" className="w-full">مشاهده جزئیات <ChevronLeft /></Button>
        </article>;
      })}
      {data.projects.length === 0 && <article className="col-span-full grid min-h-[290px] place-content-center justify-items-center rounded-[15px] border border-[#dfe7e9] bg-white/95 p-4 text-center text-[#6c7d89] shadow-[0_10px_35px_rgba(17,45,55,.055)]"><EmptyState large icon={<Folder />} title="اولین پروژه‌ات را بساز" description="پروژه را به مشتری متصل کن، بودجه و نرخ را مشخص کن و تایمر را شروع کن."><Button onClick={onCreate}><Plus /> پروژه جدید</Button></EmptyState></article>}
    </section>
  );
}
