"use client";

import { PrivateMoney } from "@/components/common/private-money";
import { StatusBadge } from "@/components/common/status-badge";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { cn } from "@/lib/cn";
import { entryMinutes } from "@/lib/format";
import type { AppData, TimeEntry } from "@/lib/types";
import { InfoRow } from "./report-table-shared";

type Props = { data: AppData; entries: TimeEntry[]; financialsHidden: boolean };
export function FreelancerMobileCards({ data, entries, financialsHidden }: Props) {
  const { t, date, duration } = useLocaleUi();
  const totalMinutes = entries.reduce((sum, entry) => sum + entryMinutes(entry), 0);
  const totalIncome = entries.reduce((sum, entry) => !entry.billable ? sum : sum + (entryMinutes(entry) / 60) * Math.max(0, entry.effectiveRate), 0);
  return <div className="grid gap-3 p-4 md:hidden">
    {entries.map((entry) => {
      const project = data.projects.find((item) => item.id === entry.projectId);
      const client = data.clients.find((item) => item.id === entry.clientId);
      const minutes = entryMinutes(entry);
      const amount = entry.billable ? (minutes / 60) * Math.max(0, entry.effectiveRate) : 0;
      return <article key={entry.id} className={cn("rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 shadow-[0_6px_20px_rgba(17,45,55,0.035)]")}>
        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><strong className="block truncate text-sm font-extrabold text-[var(--text)]">{project?.name || t("common.noProject")}</strong><span className="mt-1 block text-[10px] text-[var(--text-muted)]">{client?.name || t("common.noClient")}</span></div><StatusBadge success={entry.billable}>{entry.billable ? t("common.billable") : t("common.nonBillable")}</StatusBadge></div>
        <p className="mt-3 text-[10px] text-[var(--text-muted)]">{date(entry.startedAt, { weekday: "long", day: "numeric", month: "long" })}</p>
        <div className="mt-3 grid gap-2"><InfoRow label={t("common.duration")} value={duration(minutes)} /><InfoRow label={t("common.effectiveRate")} value={<><PrivateMoney value={entry.effectiveRate} hidden={financialsHidden} /> {t("common.currency.toman")}</>} /><InfoRow label={t("common.amount")} value={<><PrivateMoney value={amount} hidden={financialsHidden} /> {t("common.currency.toman")}</>} valueClassName={entry.billable ? "text-[var(--accent-strong)]" : "text-[var(--text-muted)]"} /></div>
        {(entry.note || entry.task) && <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 py-3"><span className="block text-[9px] text-[var(--text-muted)]">{t("reports.table.activity")}</span><p className="mt-1 text-[11px] leading-6 text-[var(--text)]">{entry.note || entry.task}</p></div>}
      </article>;
    })}
    {entries.length > 0 && <article className="rounded-2xl border border-[color-mix(in_srgb,var(--accent)_32%,var(--border))] bg-[var(--accent-soft)] p-4"><strong className="block text-sm font-extrabold text-[var(--text)]">{t("reports.table.shownTotal")}</strong><div className="mt-3 grid gap-2"><InfoRow label={t("reports.freelancer.totalTime")} value={duration(totalMinutes)} /><InfoRow label={t("common.income")} value={<><PrivateMoney value={totalIncome} hidden={financialsHidden} /> {t("common.currency.toman")}</>} valueClassName="text-[var(--accent-strong)]" /></div></article>}
  </div>;
}
