import { MoreVertical, Search, Users } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PrivateMoney } from "@/components/common/private-money";
import { StatusBadge } from "@/components/common/status-badge";
import { TableBody, TableHead, TableShell } from "@/components/common/table-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { duration, entryMinutes, fa, jalali, localDateKey } from "@/lib/format";
import type { AppData } from "@/lib/types";

export function ClientsTable({ data, setData, financialsHidden }: { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; financialsHidden: boolean }) {
  return (
    <TableShell className="p-4 shadow-[0_8px_24px_rgba(0,0,0,.035)]">
      <caption className="mb-4 caption-top text-right"><div className="flex items-center justify-between gap-3 max-[620px]:items-stretch max-[620px]:flex-col"><div><strong className="text-base text-[var(--text)]">فهرست مشتری‌ها</strong><p className="mt-1 text-[11px] text-[var(--text-muted)]">درآمد، زمان و وضعیت مشتری‌ها در یک نگاه</p></div><div className="flex min-w-[230px] items-center gap-2 rounded-[var(--control-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 text-[var(--text-muted)] focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent-soft)]"><Search className="size-4 shrink-0" /><Input className="border-0 bg-transparent px-0 focus-visible:ring-0" placeholder="جست‌وجوی مشتری" /></div></div></caption>
      <TableHead><tr><th>مشتری</th><th>پروژه‌ها</th><th>زمان کل</th><th>مبلغ</th><th>آخرین فعالیت</th><th>وضعیت</th><th>عملیات</th></tr></TableHead>
      <TableBody>{data.clients.map((client) => {
        const projects = data.projects.filter((project) => project.clientId === client.id);
        const entries = data.timeEntries.filter((entry) => entry.clientId === client.id);
        const minutes = entries.reduce((sum, entry) => sum + entryMinutes(entry), 0);
        const income = entries.reduce((sum, entry) => sum + (entry.billable ? entryMinutes(entry) / 60 * entry.effectiveRate : 0), 0);
        return <tr key={client.id}><td><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full text-base font-black text-[var(--accent-foreground)]" style={{ background: client.color }}>{client.name.slice(0, 1)}</span><div><strong className="block text-[var(--text)]">{client.name}</strong><small className="text-[var(--text-muted)]">{client.note || "بدون توضیح"}</small></div></div></td><td>{fa.format(projects.length)}<small className="block text-[var(--text-muted)]">پروژه</small></td><td>{duration(minutes)}<small className="block text-[var(--text-muted)]">ساعت</small></td><td><PrivateMoney value={income} hidden={financialsHidden} /><small className="block text-[var(--text-muted)]">تومان</small></td><td>{entries[0] ? jalali(localDateKey(new Date(entries[0].startedAt))) : "—"}</td><td><StatusBadge success={!client.archived}>{client.archived ? "غیرفعال" : "فعال"}</StatusBadge></td><td><Button variant="ghost" size="icon" onClick={() => setData((previous) => ({ ...previous, clients: previous.clients.map((item) => item.id === client.id ? { ...item, archived: !item.archived } : item) }))}><MoreVertical /></Button></td></tr>;
      })}{data.clients.length === 0 && <tr><td colSpan={7}><EmptyState icon={<Users />} title="هنوز مشتری‌ای ثبت نشده" description="با دکمه «مشتری جدید» شروع کن." /></td></tr>}</TableBody>
    </TableShell>
  );
}
