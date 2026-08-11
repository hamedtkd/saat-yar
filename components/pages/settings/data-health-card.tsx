"use client";

import { Activity, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { GuardedLink } from "@/components/layout/navigation/guarded-link";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge, type StatusBadgeTone } from "@/components/common/status-badge";
import { collectDataHealthItems, getDataHealthSummary, type DataHealthItem } from "@/lib/data-health";
import { getRecordIssues, type RecordIssue } from "@/lib/record-health";
import type { WorkRecord } from "@/lib/types";
import type { MultiTabSyncStatus } from "@/lib/multi-tab-sync-status";
import { MultiTabHealthPanel } from "./multi-tab-health-panel";
import type { SystemMessageKey } from "@/lib/i18n/system";

const toneByState: Record<DataHealthItem["state"], StatusBadgeTone> = { invalid: "danger", incomplete: "warning", review: "info" };
const issueKeys: Record<RecordIssue["code"], SystemMessageKey> = {
  "missing-start": "Clock-in time is missing.",
  "missing-end": "Clock-out time is still missing.",
  "invalid-work-span": "Clock-out must be later than clock-in.",
  "partial-lunch": "Lunch start or end is incomplete.",
  "open-break": "Break {index} is still open.",
  "invalid-lunch": "Lunch interval is invalid.",
  "invalid-break": "Break {index} interval is invalid.",
  "leave-without-type": "Select a leave type for the recorded leave.",
};

export function DataHealthCard({ records, syncStatus, clearSyncHistory }: { records: Record<string, WorkRecord>; syncStatus: MultiTabSyncStatus; clearSyncHistory: () => void }) {
  const { date, number, s } = useSystemUi();
  const items = collectDataHealthItems(records);
  const summary = getDataHealthSummary(items);
  const stateLabel = (state: DataHealthItem["state"]) => state === "invalid" ? s("Needs correction") : state === "incomplete" ? s("Incomplete") : s("Needs review");
  const itemMessages = (item: DataHealthItem) => {
    if (item.state === "review") return [s("This record was closed automatically and should be reviewed.")];
    return getRecordIssues(item.record).map((issue, index) => s(issueKeys[issue.code], { index: number(index + 1) }));
  };
  const formatDate = (value: string) => date(new Date(`${value}T12:00:00`), { weekday: "long", day: "numeric", month: "long" });

  return (
    <section id="settings-health" className="col-span-full scroll-mt-24 overflow-hidden dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] shadow-[0_5px_16px_rgba(0,0,0,.03)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] p-5">
        <div className="grid gap-2"><PanelHead icon={<Activity />} title={s("Data health")} /><p className="text-[10px] leading-5 text-[var(--text-muted)]">{s("Review incomplete, invalid, or auto-closed records in one place.")}</p></div>
        <StatusBadge tone={summary.total ? "warning" : "success"}>{summary.total ? s("{count} items", { count: number(summary.total) }) : s("Everything looks healthy")}</StatusBadge>
      </div>
      {summary.total === 0 ? (
        <div className="flex items-center gap-3 p-5 text-sm text-[var(--text-muted)]"><CheckCircle2 className="text-[var(--success)]" /> {s("No records need review.")}</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 p-4 max-[620px]:grid-cols-1 sm:p-5"><Metric label={s("Invalid")} value={summary.invalid} tone="danger" /><Metric label={s("Incomplete")} value={summary.incomplete} tone="warning" /><Metric label={s("Auto-closed")} value={summary.review} tone="info" /></div>
          <div className="grid gap-2 border-t border-[var(--border)] p-4 sm:p-5">
            {items.slice(0, 8).map((item) => <article key={item.date} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
              <div className="flex min-w-0 items-start gap-3"><AlertTriangle className="mt-0.5 size-4 flex-none text-[var(--warning)]" /><div className="grid min-w-0 gap-1"><div className="flex flex-wrap items-center gap-2"><strong className="text-xs text-[var(--text)]">{formatDate(item.date)}</strong><StatusBadge tone={toneByState[item.state]}>{stateLabel(item.state)}</StatusBadge></div><p className="line-clamp-2 text-[10px] leading-5 text-[var(--text-muted)]">{itemMessages(item).join(" · ")}</p></div></div>
              <GuardedLink href={`/today?date=${item.date}`} className="inline-flex min-h-9 items-center gap-2 rounded-[var(--control-radius)] border border-[var(--border)] px-3 text-[10px] font-bold text-[var(--text)] hover:bg-[var(--surface-1)]">{s("Review record")} <ExternalLink className="size-3.5" /></GuardedLink>
            </article>)}
          </div>
        </>
      )}
      <MultiTabHealthPanel status={syncStatus} onClear={clearSyncHistory} />
    </section>
  );

  function Metric({ label, value, tone }: { label: string; value: number; tone: StatusBadgeTone }) {
    return <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3"><span className="text-[10px] text-[var(--text-muted)]">{label}</span><StatusBadge tone={tone}>{number(value)}</StatusBadge></div>;
  }
}
