"use client";

import { MoreVertical, Plus, Search, Users } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PrivateMoney } from "@/components/common/private-money";
import { StatusBadge } from "@/components/common/status-badge";
import { TableBody, TableHead, TableShell } from "@/components/common/table-shell";
import { useBusinessUi } from "@/components/i18n/use-business-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { entryMinutes, localDateKey } from "@/lib/format";
import type { AppData, ProjectDraft } from "@/lib/types";
import { QuickProjectDialog } from "../projects/quick-project-dialog";

export function ClientsTable({ data, setData, createProject, onCreate, financialsHidden }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  createProject: (draft: ProjectDraft) => string | undefined;
  onCreate: () => void;
  financialsHidden: boolean;
}) {
  const { b, date, duration, number } = useBusinessUi();
  return (
    <TableShell className="p-4 shadow-[0_8px_24px_rgba(0,0,0,.035)]">
      <caption className="mb-4 caption-top text-start"><div className="flex items-center justify-between gap-3 max-[620px]:items-stretch max-[620px]:flex-col"><div><strong className="text-base text-[var(--text)]">{b("clients.table.title")}</strong><p className="mt-1 text-[11px] text-[var(--text-muted)]">{b("clients.table.description")}</p></div><div className="flex min-w-[230px] items-center gap-2 rounded-[var(--control-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 text-[var(--text-muted)] focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent-soft)]"><Search className="size-4 shrink-0" /><Input className="border-0 bg-transparent px-0 focus-visible:ring-0" placeholder={b("clients.table.search")} /></div></div></caption>
      <TableHead><tr><th>{b("common.client")}</th><th>{b("clients.table.projects")}</th><th>{b("clients.table.totalTime")}</th><th>{b("common.amount")}</th><th>{b("clients.table.lastActivity")}</th><th>{b("common.status")}</th><th>{b("common.actions")}</th></tr></TableHead>
      <TableBody>{data.clients.map((client) => {
        const projects = data.projects.filter((project) => project.clientId === client.id);
        const entries = data.timeEntries.filter((entry) => entry.clientId === client.id);
        const minutes = entries.reduce((sum, entry) => sum + entryMinutes(entry), 0);
        const income = entries.reduce((sum, entry) => sum + (entry.billable ? entryMinutes(entry) / 60 * entry.effectiveRate : 0), 0);
        return <tr key={client.id}><td><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full text-base font-black text-[var(--accent-foreground)]" style={{ background: client.color }}>{client.name.slice(0, 1)}</span><div><strong className="block text-[var(--text)]">{client.name}</strong><small className="text-[var(--text-muted)]">{client.note || b("clients.table.noNote")}</small></div></div></td><td>{number(projects.length)}<small className="block text-[var(--text-muted)]">{b("clients.metrics.projectSuffix")}</small></td><td>{duration(minutes)}<small className="block text-[var(--text-muted)]">{b("common.hour")}</small></td><td><PrivateMoney value={income} hidden={financialsHidden} /><small className="block text-[var(--text-muted)]">{b("common.toman")}</small></td><td>{entries[0] ? date(localDateKey(new Date(entries[0].startedAt))) : "—"}</td><td><StatusBadge success={!client.archived}>{client.archived ? b("common.inactive") : b("common.active")}</StatusBadge></td><td><div className="flex items-center gap-1">{!client.archived && <QuickProjectDialog client={client} onCreate={createProject} />}<Button variant="ghost" size="icon" title={client.archived ? b("clients.table.activate") : b("clients.table.archive")} onClick={() => setData((previous) => ({ ...previous, clients: previous.clients.map((item) => item.id === client.id ? { ...item, archived: !item.archived } : item) }))}><MoreVertical /></Button></div></td></tr>;
      })}{data.clients.length === 0 && <tr><td colSpan={7}><EmptyState icon={<Users />} title={b("clients.empty.title")} description={b("clients.empty.description")}><Button onClick={onCreate}><Plus /> {b("clients.new")}</Button></EmptyState></td></tr>}</TableBody>
    </TableShell>
  );
}
