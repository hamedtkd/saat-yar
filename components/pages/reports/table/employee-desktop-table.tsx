"use client";

import { StatusBadge } from "@/components/common/status-badge";
import { PrivateMoney } from "@/components/common/private-money";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { cn } from "@/lib/cn";
import { calc } from "@/lib/time-engine";
import { getDailyTargetMinutes } from "@/lib/work-schedule";
import type { Settings, WorkRecord } from "@/lib/types";
import { getEmployeeDayPay, TableHeading, type EmployeeTotals } from "./report-table-shared";

type Props = { monthRecords: WorkRecord[]; settings: Settings; totals: EmployeeTotals; financialsHidden: boolean };
export function EmployeeDesktopTable({ monthRecords, settings, totals, financialsHidden }: Props) {
  const { t, date, digits, duration, number } = useLocaleUi();
  const headings = [t("common.date"), t("common.clockIn"), t("common.clockOut"), t("common.lunch"), t("common.breaks"), t("common.netWorked"), t("common.leave"), t("common.balance"), t("common.estimatedSalary"), t("common.note")];
  return <div className="hidden w-full overflow-x-auto px-4 pb-5 pt-3 md:block sm:px-5"><table className="w-full min-w-270 border-collapse text-[11px]">
    <thead><tr>{headings.map((heading) => <TableHeading key={heading}>{heading}</TableHeading>)}</tr></thead>
    <tbody>{monthRecords.map((record) => {
      const dailyTarget = getDailyTargetMinutes(record.date, settings);
      const result = calc(record, dailyTarget);
      const earnedAmount = getEmployeeDayPay({ record, settings, dailyTarget });
      return <tr key={record.date} className="transition-colors hover:bg-[var(--surface-2)]">
        <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3"><div className="grid gap-1"><strong className="text-[11px] text-[var(--text)]">{date(record.date, { weekday: "long", day: "numeric", month: "long" })}</strong>{record.holiday && <span className="text-[9px] font-semibold text-[var(--danger)]">{t("common.holiday")}</span>}</div></td>
        <td dir="ltr" className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 text-[var(--text)]">{record.start ? digits(record.start) : "—"}</td>
        <td dir="ltr" className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 text-[var(--text)]">{record.end ? digits(record.end) : "—"}</td>
        <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 text-[var(--text)]"><div className="grid gap-1"><span>{duration(record.lunchMinutes)}</span><small className={cn("text-[9px]", record.lunchPaid ? "text-[var(--accent-strong)]" : "text-[var(--text-muted)]")}>{record.lunchPaid ? t("common.paid") : t("common.unpaid")}</small></div></td>
        <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 text-[var(--text)]"><div className="grid gap-1"><span>{duration(result.breakMinutes)}</span><small className="text-[9px] text-[var(--text-muted)]">{record.breaks.length > 0 ? t("reports.table.breakCount", { count: number(record.breaks.length) }) : t("common.noBreak")}</small></div></td>
        <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 font-extrabold text-[var(--text)]">{duration(result.worked)}</td>
        <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 text-[var(--text)]">{result.leave > 0 ? <div className="grid gap-1"><span>{duration(result.leave)}</span><small className="text-[9px] text-[var(--text-muted)]">{record.leaveType === "hourly" ? t("reports.table.hourlyLeave") : t("reports.table.leaveRecorded")}</small></div> : "—"}</td>
        <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3"><StatusBadge success={result.balance >= 0}>{result.balance >= 0 ? t("reports.table.overtimeValue", { duration: duration(result.balance) }) : t("reports.table.deficitValue", { duration: duration(Math.abs(result.balance)) })}</StatusBadge></td>
        <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 font-extrabold text-[var(--text)]"><PrivateMoney value={earnedAmount} hidden={financialsHidden} /> {t("common.currency.toman")}</td>
        <td className="max-w-60 border-b border-[var(--border)] px-3 py-3 text-[var(--text)]"><span className="block truncate" title={record.note || undefined}>{record.note || "—"}</span></td>
      </tr>;
    })}</tbody>
    <tfoot><tr className="bg-[var(--surface-2)]"><td colSpan={3} className="border-t border-[var(--border)] px-3 py-3 font-extrabold text-[var(--text)]">{t("reports.table.monthTotal")}</td><td colSpan={2} className="border-t border-[var(--border)] px-3 py-3 text-[var(--text-muted)]">{t("reports.table.restValue", { duration: duration(totals.rest) })}</td><td className="border-t border-[var(--border)] px-3 py-3 font-extrabold text-[var(--text)]">{duration(totals.worked)}</td><td className="border-t border-[var(--border)] px-3 py-3 text-[var(--text-muted)]">{duration(totals.leave)}</td><td className={cn("border-t border-[var(--border)] px-3 py-3 font-extrabold", totals.balance >= 0 ? "text-[var(--accent-strong)]" : "text-[var(--danger)]")}>{duration(totals.balance, true)}</td><td className="border-t border-[var(--border)] px-3 py-3 font-black text-[var(--accent-strong)]"><PrivateMoney value={totals.income} hidden={financialsHidden} /> {t("common.currency.toman")}</td><td className="border-t border-[var(--border)] px-3 py-3" /></tr></tfoot>
  </table></div>;
}
