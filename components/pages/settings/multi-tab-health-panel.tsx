"use client";

import { Clock3, History, MonitorSmartphone, RefreshCw, Trash2, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { shortTabId, type MultiTabSyncStatus } from "@/lib/multi-tab-sync-status";
import type { SyncChangeKind } from "@/lib/multi-tab-sync";
import type { SystemMessageKey } from "@/lib/i18n/system";

const pathKeys: Record<string, SystemMessageKey> = { "/": "Home", "/today": "Today", "/month": "My month", "/leave": "Leave", "/reports": "Reports", "/settings": "Settings", "/clients": "Clients", "/projects": "Projects", "/invoices": "Invoices" };
const changeKeys: Record<SyncChangeKind, SystemMessageKey> = { attendance: "Attendance and time", settings: "Settings", business: "Work information", reporting: "Reports", general: "General data" };

export function MultiTabHealthPanel({ status, onClear }: { status: MultiTabSyncStatus; onClear: () => void }) {
  const { date, s } = useSystemUi();
  const formatTime = (value: string | null) => {
    if (!value) return s("No changes received yet");
    const parsed = new Date(value);
    return Number.isFinite(parsed.getTime()) ? date(parsed, { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : s("Invalid time");
  };
  const tab = (value: string | null) => value ? shortTabId(value) : s("Unknown");
  return (
    <div className="grid gap-3 border-t border-[var(--border)] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2"><RefreshCw className="size-4 text-[var(--accent-strong)]" aria-hidden="true" /><strong className="text-xs text-[var(--text)]">{s("Multi-tab sync health")}</strong></div>
        <div className="flex items-center gap-2"><StatusBadge tone={!status.supported ? "neutral" : status.pending ? "warning" : "success"}>{!status.supported ? s("Disabled") : status.pending ? s("Needs a decision") : s("In sync")}</StatusBadge>{status.events.length > 0 && <Button type="button" variant="ghost" onClick={onClear} aria-label={s("Clear sync history")}><Trash2 /> {s("Clear")}</Button>}</div>
      </div>
      {!status.supported ? <p className="text-[10px] leading-5 text-[var(--text-muted)]">{s("This browser does not support BroadcastChannel.")}</p> : <div className="grid grid-cols-3 gap-2 max-[700px]:grid-cols-1"><Metric icon={<MonitorSmartphone />} label={s("Current tab")} value={tab(status.currentTabId)} /><Metric icon={<RefreshCw />} label={s("Last sender tab")} value={tab(status.sourceTabId)} /><Metric icon={<Clock3 />} label={s("Last external save")} value={formatTime(status.savedAt)} /></div>}
      {status.pending && <div className="flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,var(--warning)_30%,var(--border))] bg-[var(--warning-soft)] p-3 text-[10px] leading-5 text-[var(--warning)]"><TriangleAlert className="mt-0.5 size-4 flex-none" aria-hidden="true" />{s("A newer version arrived from another tab, but it is waiting because there are unsaved changes or an active save.")}</div>}
      {status.events.length > 0 && <div className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3"><div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text)]"><History className="size-4" /> {s("Recent events")}</div>{status.events.map((event) => <div key={`${event.receivedAt}-${event.sourceTabId}`} className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-2 text-[10px]"><span className="text-[var(--text-muted)]">{s("Tab {tab} · {path} · {kind} · {time}", { tab: tab(event.sourceTabId), path: pathKeys[event.sourcePath] ? s(pathKeys[event.sourcePath]) : event.sourcePath, kind: s(changeKeys[event.changeKind]), time: formatTime(event.savedAt) })}</span><StatusBadge tone={event.kind === "deferred" ? "warning" : "success"}>{event.kind === "deferred" ? s("Deferred") : s("Loaded")}</StatusBadge></div>)}</div>}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3"><span className="text-[var(--accent-strong)] [&_svg]:size-4">{icon}</span><span className="grid min-w-0 gap-1"><small className="text-[9px] text-[var(--text-muted)]">{label}</small><strong className="truncate text-[10px] text-[var(--text)]">{value}</strong></span></div>;
}
