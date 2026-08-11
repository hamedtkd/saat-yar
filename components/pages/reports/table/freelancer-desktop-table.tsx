"use client";

import { PrivateMoney } from "@/components/common/private-money";
import { StatusBadge } from "@/components/common/status-badge";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { entryMinutes } from "@/lib/format";
import type { AppData, TimeEntry } from "@/lib/types";
import { TableHeading } from "./report-table-shared";

type Props = { data: AppData; entries: TimeEntry[]; financialsHidden: boolean };
export function FreelancerDesktopTable({ data, entries, financialsHidden }: Props) {
  const { t, date, duration } = useLocaleUi();
  const headings = [t("common.date"), t("common.client"), t("common.project"), t("common.description"), t("common.duration"), t("common.effectiveRate"), t("common.amount"), t("common.status")];
  const totalMinutes = entries.reduce((sum, entry) => sum + entryMinutes(entry), 0);
  const totalIncome = entries.reduce((sum, entry) => !entry.billable ? sum : sum + (entryMinutes(entry) / 60) * Math.max(0, entry.effectiveRate), 0);
  return <div className="hidden w-full overflow-x-auto px-4 pb-5 pt-3 md:block sm:px-5"><table className="w-full min-w-245 border-collapse text-[11px]">
    <thead><tr>{headings.map((heading) => <TableHeading key={heading}>{heading}</TableHeading>)}</tr></thead>
    <tbody>{entries.map((entry) => {
      const project = data.projects.find((item) => item.id === entry.projectId);
      const client = data.clients.find((item) => item.id === entry.clientId);
      const minutes = entryMinutes(entry);
      const amount = entry.billable ? (minutes / 60) * Math.max(0, entry.effectiveRate) : 0;
      return <tr key={entry.id} className="transition-colors hover:bg-[var(--surface-2)]">
        <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 text-[var(--text)]">{date(entry.startedAt, { day: "numeric", month: "long" })}</td>
        <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 text-[var(--text)]">{client?.name || "—"}</td>
        <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3"><strong className="text-[var(--text)]">{project?.name || "—"}</strong></td>
        <td className="max-w-65 border-b border-[var(--border)] px-3 py-3 text-[var(--text)]"><span className="block truncate" title={entry.note || entry.task || undefined}>{entry.note || entry.task || "—"}</span></td>
        <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 font-extrabold text-[var(--text)]">{duration(minutes)}</td>
        <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 text-[var(--text)]"><PrivateMoney value={entry.effectiveRate} hidden={financialsHidden} /> {t("common.currency.toman")}</td>
        <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 font-extrabold text-[var(--text)]"><PrivateMoney value={amount} hidden={financialsHidden} /> {t("common.currency.toman")}</td>
        <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3"><StatusBadge success={entry.billable}>{entry.billable ? t("common.billable") : t("common.nonBillable")}</StatusBadge></td>
      </tr>;
    })}</tbody>
    {entries.length > 0 && <tfoot><tr className="bg-[var(--surface-2)]"><td colSpan={4} className="border-t border-[var(--border)] px-3 py-3 font-extrabold text-[var(--text)]">{t("reports.table.shownTotal")}</td><td className="border-t border-[var(--border)] px-3 py-3 font-extrabold text-[var(--text)]">{duration(totalMinutes)}</td><td className="border-t border-[var(--border)] px-3 py-3" /><td className="border-t border-[var(--border)] px-3 py-3 font-black text-[var(--accent-strong)]"><PrivateMoney value={totalIncome} hidden={financialsHidden} /> {t("common.currency.toman")}</td><td className="border-t border-[var(--border)] px-3 py-3" /></tr></tfoot>}
  </table></div>;
}
