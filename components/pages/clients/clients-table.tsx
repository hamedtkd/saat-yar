import { MoreVertical, Search, Users } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { duration, entryMinutes, fa, jalali, localDateKey, money } from "@/lib/format";
import { tw } from "@/lib/tw";
import type { AppData } from "@/lib/types";

export function ClientsTable({ data, setData }: { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>> }) {
  return (
    <article className={tw("panel", "table-panel")}>
      <PanelHead icon={<Users />} title="فهرست مشتری‌ها"><div className={tw("search-box")}><Search /><Input placeholder="جست‌وجوی مشتری" /></div></PanelHead>
      <div className={tw("table-wrap")}><table><thead><tr><th>مشتری</th><th>پروژه‌ها</th><th>زمان کل</th><th>مبلغ</th><th>آخرین فعالیت</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>
        {data.clients.map((client) => {
          const projects = data.projects.filter((project) => project.clientId === client.id);
          const entries = data.timeEntries.filter((entry) => entry.clientId === client.id);
          const minutes = entries.reduce((sum, entry) => sum + entryMinutes(entry), 0);
          const income = entries.reduce((sum, entry) => sum + (entry.billable ? entryMinutes(entry) / 60 * entry.effectiveRate : 0), 0);
          return <tr key={client.id}><td><strong className={tw("avatar-name")}><span style={{ background: client.color }}>{client.name.slice(0, 1)}</span>{client.name}</strong><small>{client.note}</small></td><td>{fa.format(projects.length)}<small>پروژه</small></td><td>{duration(minutes)}<small>ساعت</small></td><td>{money(income)}<small>تومان</small></td><td>{entries[0] ? jalali(localDateKey(new Date(entries[0].startedAt))) : "—"}</td><td><StatusBadge success={!client.archived}>{client.archived ? "غیرفعال" : "فعال"}</StatusBadge></td><td><Button variant="outline" size="icon" onClick={() => setData((previous) => ({ ...previous, clients: previous.clients.map((item) => item.id === client.id ? { ...item, archived: !item.archived } : item) }))}><MoreVertical /></Button></td></tr>;
        })}
        {data.clients.length === 0 && <tr><td colSpan={7}><EmptyState icon={<Users />} title="هنوز مشتری‌ای ثبت نشده" description="با دکمه «مشتری جدید» شروع کن." /></td></tr>}
      </tbody></table></div>
    </article>
  );
}
