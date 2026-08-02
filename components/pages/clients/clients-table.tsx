import { MoreVertical, Search, Users } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { duration, entryMinutes, fa, jalali, localDateKey, money } from "@/lib/format";
import type { AppData } from "@/lib/types";
import { cn } from "@/lib/cn";

export function ClientsTable({ data, setData }: { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>> }) {
  return (
    <article className={cn("rounded-[15px] border border-[#dfe7e9] bg-white/95 shadow-[0_10px_35px_rgba(17,45,55,.055)] p-4", "min-w-0 p-[13px]")}>
      <PanelHead icon={<Users />} title="فهرست مشتری‌ها"><div className={cn("flex min-w-[230px] items-center gap-[7px] rounded-[11px] border border-[#dfe7e9] bg-white px-[10px] [&_svg]:flex-none [&_svg]:text-[#6c7d89] [&_input]:border-0 [&_input]:px-0 [&_input]:shadow-none")}><Search /><Input placeholder="جست‌وجوی مشتری" /></div></PanelHead>
      <div className={cn("w-full overflow-x-auto [&_table]:w-full [&_table]:border-collapse [&_table]:text-[11px] [&_th]:h-[39px] [&_th]:whitespace-nowrap [&_th]:border-y [&_th]:border-[#edf1f2] [&_th]:bg-[#fbfcfc] [&_th]:px-3 [&_th]:py-2 [&_th]:text-right [&_th]:font-semibold [&_th]:text-[#536975] [&_td]:min-h-[46px] [&_td]:whitespace-nowrap [&_td]:border-b [&_td]:border-[#edf1f2] [&_td]:px-3 [&_td]:py-[9px] [&_td]:text-[#2e4856] [&_td_strong]:flex [&_td_strong]:items-center [&_td_strong]:gap-[7px] [&_td_strong]:text-[11px] [&_td_strong]:text-[#102a3a] [&_td_strong>i]:h-[7px] [&_td_strong>i]:w-[7px] [&_td_strong>i]:rounded-full [&_td_small]:mt-[3px] [&_td_small]:block [&_td_small]:text-[9px] [&_td_small]:text-[#6c7d89] [&_td_input]:min-w-[175px]")}><table><thead><tr><th>مشتری</th><th>پروژه‌ها</th><th>زمان کل</th><th>مبلغ</th><th>آخرین فعالیت</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>
        {data.clients.map((client) => {
          const projects = data.projects.filter((project) => project.clientId === client.id);
          const entries = data.timeEntries.filter((entry) => entry.clientId === client.id);
          const minutes = entries.reduce((sum, entry) => sum + entryMinutes(entry), 0);
          const income = entries.reduce((sum, entry) => sum + (entry.billable ? entryMinutes(entry) / 60 * entry.effectiveRate : 0), 0);
          return <tr key={client.id}><td><strong className={cn("[&>span]:grid [&>span]:h-[39px] [&>span]:w-[39px] [&>span]:place-items-center [&>span]:rounded-full [&>span]:text-[17px] [&>span]:text-white")}><span style={{ background: client.color }}>{client.name.slice(0, 1)}</span>{client.name}</strong><small>{client.note}</small></td><td>{fa.format(projects.length)}<small>پروژه</small></td><td>{duration(minutes)}<small>ساعت</small></td><td>{money(income)}<small>تومان</small></td><td>{entries[0] ? jalali(localDateKey(new Date(entries[0].startedAt))) : "—"}</td><td><StatusBadge success={!client.archived}>{client.archived ? "غیرفعال" : "فعال"}</StatusBadge></td><td><Button variant="outline" size="icon" onClick={() => setData((previous) => ({ ...previous, clients: previous.clients.map((item) => item.id === client.id ? { ...item, archived: !item.archived } : item) }))}><MoreVertical /></Button></td></tr>;
        })}
        {data.clients.length === 0 && <tr><td colSpan={7}><EmptyState icon={<Users />} title="هنوز مشتری‌ای ثبت نشده" description="با دکمه «مشتری جدید» شروع کن." /></td></tr>}
      </tbody></table></div>
    </article>
  );
}
