import { Activity, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import { GuardedLink } from "@/components/layout/navigation/guarded-link";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge, type StatusBadgeTone } from "@/components/common/status-badge";
import { collectDataHealthItems, getDataHealthSummary, type DataHealthItem } from "@/lib/data-health";
import type { WorkRecord } from "@/lib/types";
import type { MultiTabSyncStatus } from "@/lib/multi-tab-sync-status";
import { MultiTabHealthPanel } from "./multi-tab-health-panel";

const toneByState: Record<DataHealthItem["state"], StatusBadgeTone> = {
  invalid: "danger",
  incomplete: "warning",
  review: "info",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { weekday: "long", day: "numeric", month: "long" }).format(new Date(`${date}T12:00:00`));
}

export function DataHealthCard({ records, syncStatus, clearSyncHistory }: { records: Record<string, WorkRecord>; syncStatus: MultiTabSyncStatus; clearSyncHistory: () => void }) {
  const items = collectDataHealthItems(records);
  const summary = getDataHealthSummary(items);

  return (
    <section className="col-span-full overflow-hidden rounded-[15px] border border-[var(--border)] bg-[var(--surface-1)] shadow-[0_6px_20px_rgba(17,45,55,.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] p-5">
        <div className="grid gap-2">
          <PanelHead icon={<Activity />} title="سلامت داده‌ها" />
          <p className="text-[10px] leading-5 text-[var(--text-muted)]">رکوردهای ناقص، ناسالم یا بسته‌شده خودکار را یکجا بررسی کن.</p>
        </div>
        <StatusBadge tone={summary.total ? "warning" : "success"}>{summary.total ? `${summary.total.toLocaleString("fa-IR")} مورد` : "همه‌چیز سالم است"}</StatusBadge>
      </div>

      {summary.total === 0 ? (
        <div className="flex items-center gap-3 p-5 text-sm text-[var(--text-muted)]"><CheckCircle2 className="text-[var(--success)]" /> هیچ رکورد نیازمند بررسی پیدا نشد.</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 p-4 max-[620px]:grid-cols-1 sm:p-5">
            <Metric label="نامعتبر" value={summary.invalid} tone="danger" />
            <Metric label="ناقص" value={summary.incomplete} tone="warning" />
            <Metric label="بسته‌شده خودکار" value={summary.review} tone="info" />
          </div>
          <div className="grid gap-2 border-t border-[var(--border)] p-4 sm:p-5">
            {items.slice(0, 8).map((item) => (
              <article key={item.date} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                <div className="flex min-w-0 items-start gap-3">
                  <AlertTriangle className="mt-0.5 size-4 flex-none text-[var(--warning)]" />
                  <div className="grid min-w-0 gap-1">
                    <div className="flex flex-wrap items-center gap-2"><strong className="text-xs text-[var(--text)]">{formatDate(item.date)}</strong><StatusBadge tone={toneByState[item.state]}>{item.label}</StatusBadge></div>
                    <p className="line-clamp-2 text-[10px] leading-5 text-[var(--text-muted)]">{item.messages.join(" · ")}</p>
                  </div>
                </div>
                <GuardedLink href={`/today?date=${item.date}`} className="inline-flex min-h-9 items-center gap-2 rounded-[var(--control-radius)] border border-[var(--border)] px-3 text-[10px] font-bold text-[var(--text)] hover:bg-[var(--surface-1)]">بررسی رکورد <ExternalLink className="size-3.5" /></GuardedLink>
              </article>
            ))}
          </div>
        </>
      )}
      <MultiTabHealthPanel status={syncStatus} onClear={clearSyncHistory} />
    </section>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: StatusBadgeTone }) {
  return <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3"><span className="text-[10px] text-[var(--text-muted)]">{label}</span><StatusBadge tone={tone}>{value.toLocaleString("fa-IR")}</StatusBadge></div>;
}
