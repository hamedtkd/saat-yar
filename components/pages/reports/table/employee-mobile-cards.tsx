"use client";

import { StatusBadge } from "@/components/common/status-badge";
import { PrivateMoney } from "@/components/common/private-money";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { cn } from "@/lib/cn";
import { calc } from "@/lib/time-engine";
import { getDailyTargetMinutes } from "@/lib/work-schedule";
import type { Settings, WorkRecord } from "@/lib/types";
import { getEmployeeDayPay, InfoRow, type EmployeeTotals } from "./report-table-shared";

type Props = { monthRecords: WorkRecord[]; settings: Settings; totals: EmployeeTotals; financialsHidden: boolean };
export function EmployeeMobileCards({ monthRecords, settings, totals, financialsHidden }: Props) {
  const { t, date, digits, duration, number } = useLocaleUi();
  return <div className="grid gap-3 p-4 md:hidden">
    {monthRecords.map((record) => {
      const dailyTarget = getDailyTargetMinutes(record.date, settings);
      const result = calc(record, dailyTarget);
      const earnedAmount = getEmployeeDayPay({ record, settings, dailyTarget });
      return <article key={record.date} className={cn("rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 shadow-[0_6px_20px_rgba(17,45,55,0.035)]")}>
        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><strong className="block text-sm font-extrabold text-[var(--text)]">{date(record.date, { weekday: "long", day: "numeric", month: "long" })}</strong><div className="mt-2 flex flex-wrap items-center gap-1.5">{record.holiday && <span className="rounded-full bg-[var(--danger-soft)] px-2 py-1 text-[9px] font-bold text-[var(--danger)]">{t("common.holiday")}</span>}{result.leave > 0 && <span className="rounded-full bg-[var(--info-soft)] px-2 py-1 text-[9px] font-bold text-[var(--info)]">{t("common.leave")} {duration(result.leave)}</span>}</div></div><StatusBadge success={result.balance >= 0}>{result.balance >= 0 ? `+${duration(result.balance)}` : `−${duration(Math.abs(result.balance))}`}</StatusBadge></div>
        <div className="mt-4 grid grid-cols-2 gap-2"><InfoRow label={t("common.clockIn")} value={record.start ? digits(record.start) : "—"} valueClassName="tabular-nums" /><InfoRow label={t("common.clockOut")} value={record.end ? digits(record.end) : "—"} valueClassName="tabular-nums" /></div>
        <div className="mt-2 grid gap-2"><InfoRow label={t("common.netWorked")} value={duration(result.worked)} /><InfoRow label={t("common.lunch")} value={<span>{duration(record.lunchMinutes)}<small className={cn("ms-2 text-[9px] font-medium", record.lunchPaid ? "text-[var(--accent-strong)]" : "text-[var(--text-muted)]")}>{record.lunchPaid ? t("common.paid") : t("common.unpaid")}</small></span>} /><InfoRow label={t("common.breaks")} value={record.breaks.length > 0 ? `${duration(result.breakMinutes)} · ${t("reports.table.breakCount", { count: number(record.breaks.length) })}` : t("common.noBreak")} /><InfoRow label={t("common.estimatedSalary")} value={<><PrivateMoney value={earnedAmount} hidden={financialsHidden} /> {t("common.currency.toman")}</>} valueClassName="text-[var(--accent-strong)]" /></div>
        {record.note && <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 py-3"><span className="block text-[9px] text-[var(--text-muted)]">{t("common.note")}</span><p className="mt-1 text-[11px] leading-6 text-[var(--text)]">{record.note}</p></div>}
      </article>;
    })}
    <article className="rounded-2xl border border-[color-mix(in_srgb,var(--accent)_32%,var(--border))] bg-[var(--accent-soft)] p-4"><strong className="block text-sm font-extrabold text-[var(--text)]">{t("reports.table.monthTotal")}</strong><div className="mt-3 grid gap-2"><InfoRow label={t("common.netWorked")} value={duration(totals.worked)} /><InfoRow label={t("common.rest")} value={duration(totals.rest)} /><InfoRow label={t("common.leave")} value={duration(totals.leave)} /><InfoRow label={t("common.balance")} value={duration(totals.balance, true)} valueClassName={totals.balance >= 0 ? "text-[var(--accent-strong)]" : "text-[var(--danger)]"} /><InfoRow label={t("common.estimatedSalary")} value={<><PrivateMoney value={totals.income} hidden={financialsHidden} /> {t("common.currency.toman")}</>} valueClassName="text-[var(--accent-strong)]" /></div></article>
  </div>;
}
