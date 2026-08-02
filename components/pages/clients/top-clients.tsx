import { BarChart3 } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { Button } from "@/components/ui/button";
import { duration, entryMinutes, fa } from "@/lib/format";
import type { AppData, Tab } from "@/lib/types";
import { cn } from "@/lib/cn";

export function TopClients({ data, setTab }: { data: AppData; setTab: (tab: Tab) => void }) {
  const active = data.clients.filter((client) => !client.archived);
  const totals = active.map((client) => data.timeEntries.filter((entry) => entry.clientId === client.id).reduce((sum, entry) => sum + entryMinutes(entry), 0));
  const max = Math.max(1, ...totals);
  return (
    <aside className={cn("rounded-[15px] border border-[#dfe7e9] bg-white/95 shadow-[0_10px_35px_rgba(17,45,55,.055)] p-4", "p-5 max-[900px]:order-first")}>
      <PanelHead icon={<BarChart3 />} title="مشتری‌های برتر این ماه" />
      {active.slice(0, 4).map((client, index) => {
        const minutes = totals[index] ?? 0;
        return <div className={cn("py-3 [&>div]:flex [&>div]:justify-between [&>div]:gap-3 [&_strong]:text-xs [&_span]:text-[9px] [&_span]:text-[#6c7d89] [&_small]:text-[9px] [&_small]:text-[#6c7d89] [&>i]:my-2 [&>i]:block [&>i]:h-[7px] [&>i]:overflow-hidden [&>i]:rounded-[10px] [&>i]:bg-[#e8edef] [&>i>b]:block [&>i>b]:h-full [&>i>b]:rounded-[inherit] [&>i>b]:bg-[#079b60]")} key={client.id}><div><strong>{client.name}</strong><span>{duration(minutes)} ساعت</span></div><i><b style={{ width: `${Math.max(7, minutes / max * 100)}%`, background: client.color }} /></i><small>رتبه {fa.format(index + 1)}</small></div>;
      })}
      <Button variant="outline" className={cn("w-full")} onClick={() => setTab("reports")}>مشاهده گزارش کامل <BarChart3 /></Button>
    </aside>
  );
}
