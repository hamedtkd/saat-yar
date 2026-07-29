import { BarChart3 } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { Button } from "@/components/ui/button";
import { duration, entryMinutes, fa } from "@/lib/format";
import { tw } from "@/lib/tw";
import type { AppData, Tab } from "@/lib/types";

export function TopClients({ data, setTab }: { data: AppData; setTab: (tab: Tab) => void }) {
  const active = data.clients.filter((client) => !client.archived);
  const totals = active.map((client) => data.timeEntries.filter((entry) => entry.clientId === client.id).reduce((sum, entry) => sum + entryMinutes(entry), 0));
  const max = Math.max(1, ...totals);
  return (
    <aside className={tw("panel", "top-clients")}>
      <PanelHead icon={<BarChart3 />} title="مشتری‌های برتر این ماه" />
      {active.slice(0, 4).map((client, index) => {
        const minutes = totals[index] ?? 0;
        return <div className={tw("bar-item")} key={client.id}><div><strong>{client.name}</strong><span>{duration(minutes)} ساعت</span></div><i><b style={{ width: `${Math.max(7, minutes / max * 100)}%`, background: client.color }} /></i><small>رتبه {fa.format(index + 1)}</small></div>;
      })}
      <Button variant="outline" className={tw("full")} onClick={() => setTab("reports")}>مشاهده گزارش کامل <BarChart3 /></Button>
    </aside>
  );
}
