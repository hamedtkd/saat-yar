import { StatusBadge } from "@/components/common/status-badge";
import { cn } from "@/lib/cn";
import { duration, faDigits, jalali, money } from "@/lib/format";
import { calc } from "@/lib/time-engine";
import type { Settings, WorkRecord } from "@/lib/types";
import { EMPLOYEE_HEADINGS, getEmployeeDayPay, TableHeading, type EmployeeTotals } from "./report-table-shared";

type Props = { monthRecords: WorkRecord[]; settings: Settings; dailyTarget: number; totals: EmployeeTotals; financialsHidden: boolean };
export function EmployeeDesktopTable({
  monthRecords,
  settings,
  dailyTarget,
  totals,
  financialsHidden,
}: Props) {
  return (
    <div className="hidden w-full overflow-x-auto px-4 pb-5 pt-3 md:block sm:px-5">
      <table className="w-full min-w-270 border-collapse text-[11px]">
        <thead>
          <tr>
            {EMPLOYEE_HEADINGS.map((heading) => (
              <TableHeading key={heading}>{heading}</TableHeading>
            ))}
          </tr>
        </thead>

        <tbody>
          {monthRecords.map((record) => {
            const result = calc(record, dailyTarget);

            const earnedAmount = getEmployeeDayPay({
              record,
              settings,
              dailyTarget,
            });

            return (
              <tr
                key={record.date}
                className="transition-colors hover:bg-[#fbfdfc]"
              >
                <td className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3">
                  <div className="grid gap-1">
                    <strong className="text-[11px] text-[#102a3a]">
                      {jalali(record.date, {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </strong>

                    {record.holiday && (
                      <span className="text-[9px] font-semibold text-[#e54845]">
                        روز تعطیل
                      </span>
                    )}
                  </div>
                </td>

                <td
                  dir="ltr"
                  className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3 text-[#2e4856]"
                >
                  {record.start ? faDigits(record.start) : "—"}
                </td>

                <td
                  dir="ltr"
                  className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3 text-[#2e4856]"
                >
                  {record.end ? faDigits(record.end) : "—"}
                </td>

                <td className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3 text-[#2e4856]">
                  <div className="grid gap-1">
                    <span>{duration(record.lunchMinutes)}</span>

                    <small
                      className={cn(
                        "text-[9px]",
                        record.lunchPaid ? "text-[#079b60]" : "text-[#6c7d89]",
                      )}
                    >
                      {record.lunchPaid ? "با حقوق" : "بدون حقوق"}
                    </small>
                  </div>
                </td>

                <td className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3 text-[#2e4856]">
                  <div className="grid gap-1">
                    <span>{duration(result.breakMinutes)}</span>

                    <small className="text-[9px] text-[#6c7d89]">
                      {record.breaks.length > 0
                        ? `${faDigits(String(record.breaks.length))} وقفه`
                        : "بدون وقفه"}
                    </small>
                  </div>
                </td>

                <td className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3 font-extrabold text-[#102a3a]">
                  {duration(result.worked)}
                </td>

                <td className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3 text-[#2e4856]">
                  {result.leave > 0 ? (
                    <div className="grid gap-1">
                      <span>{duration(result.leave)}</span>

                      <small className="text-[9px] text-[#6c7d89]">
                        {record.leaveType === "hourly"
                          ? "مرخصی ساعتی"
                          : "مرخصی ثبت‌شده"}
                      </small>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>

                <td className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3">
                  <StatusBadge success={result.balance >= 0}>
                    {result.balance >= 0
                      ? `اضافه ${duration(result.balance)}`
                      : `کسری ${duration(Math.abs(result.balance))}`}
                  </StatusBadge>
                </td>

                <td className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3 font-extrabold text-[#102a3a]">
                  {financialsHidden ? "••••••" : money(earnedAmount)} تومان
                </td>

                <td className="max-w-60 border-b border-[#edf1f2] px-3 py-3 text-[#2e4856]">
                  <span
                    className="block truncate"
                    title={record.note || undefined}
                  >
                    {record.note || "—"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>

        <tfoot>
          <tr className="bg-[#f8fbfa]">
            <td
              colSpan={3}
              className="border-t border-[#dfe7e9] px-3 py-3 font-extrabold text-[#102a3a]"
            >
              جمع این ماه
            </td>

            <td
              colSpan={2}
              className="border-t border-[#dfe7e9] px-3 py-3 text-[#526b75]"
            >
              استراحت {duration(totals.rest)}
            </td>

            <td className="border-t border-[#dfe7e9] px-3 py-3 font-extrabold text-[#102a3a]">
              {duration(totals.worked)}
            </td>

            <td className="border-t border-[#dfe7e9] px-3 py-3 text-[#526b75]">
              {duration(totals.leave)}
            </td>

            <td
              className={cn(
                "border-t border-[#dfe7e9] px-3 py-3 font-extrabold",
                totals.balance >= 0 ? "text-[#079b60]" : "text-[#e54845]",
              )}
            >
              {duration(totals.balance, true)}
            </td>

            <td className="border-t border-[#dfe7e9] px-3 py-3 font-black text-[#079b60]">
              {financialsHidden ? "••••••" : money(totals.income)} تومان
            </td>

            <td className="border-t border-[#dfe7e9] px-3 py-3" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

