import { Trophy } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { ProgressBar } from "@/components/common/progress-bar";
import { SurfaceCard } from "@/components/common/surface-card";
import { duration, entryMinutes, fa } from "@/lib/format";
import type { AppData, Tab } from "@/lib/types";

export function TopClients({ data, setTab }: { data: AppData; setTab: (tab: Tab) => void }) {
  const ranked = data.clients.map((client) => ({ client, minutes: data.timeEntries.filter((entry) => entry.clientId === client.id).reduce((sum, entry) => sum + entryMinutes(entry), 0) })).sort((a, b) => b.minutes - a.minutes).slice(0, 5);
  const max = Math.max(1, ranked[0]?.minutes ?? 1);
  return <SurfaceCard as="aside" className="p-5 max-[900px]:order-first"><PanelHead icon={<Trophy />} title="مشتری‌های برتر" />
    <div className="divide-y divide-[var(--border)]">{ranked.map(({ client, minutes }, index) => <button type="button" className="block w-full py-4 text-right" key={client.id} onClick={() => setTab("projects")}><div className="mb-2 flex justify-between gap-3"><strong className="text-xs text-[var(--text)]">{client.name}</strong><span className="text-[10px] text-[var(--text-muted)]">{duration(minutes)} ساعت</span></div><ProgressBar value={Math.max(7, minutes / max * 100)} /><small className="mt-2 block text-[10px] text-[var(--text-muted)]">رتبه {fa.format(index + 1)}</small></button>)}{ranked.length === 0 && <p className="py-8 text-center text-xs text-[var(--text-muted)]">هنوز داده‌ای برای رتبه‌بندی وجود ندارد.</p>}</div>
  </SurfaceCard>;
}
