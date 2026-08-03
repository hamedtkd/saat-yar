import { StatusBadge } from "@/components/common/status-badge";
import { cn } from "@/lib/cn";
import { duration, faDigits, jalali, money } from "@/lib/format";
import { calc } from "@/lib/time-engine";
import type { Settings, WorkRecord } from "@/lib/types";
import { getEmployeeDayPay, InfoRow, type EmployeeTotals } from "./report-table-shared";

type Props = { monthRecords: WorkRecord[]; settings: Settings; dailyTarget: number; totals: EmployeeTotals; financialsHidden: boolean };
export function EmployeeMobileCards({
  monthRecords,
  settings,
  dailyTarget,
  totals,
  financialsHidden,
}: Props) {
  return (
    <div className="grid gap-3 p-4 md:hidden">
      {monthRecords.map((record) => {
        const result = calc(record, dailyTarget);

        const earnedAmount = getEmployeeDayPay({
          record,
          settings,
          dailyTarget,
        });

        return (
          <article
            key={record.date}
            className={cn(
              "rounded-2xl border border-[#e2ebe8]",
              "bg-[#fbfdfc] p-4",
              "shadow-[0_6px_20px_rgba(17,45,55,0.035)]",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <strong className="block text-sm font-extrabold text-[#102a3a]">
                  {jalali(record.date, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </strong>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {record.holiday && (
                    <span className="rounded-full bg-[#fff1f0] px-2 py-1 text-[9px] font-bold text-[#e54845]">
                      روز تعطیل
                    </span>
                  )}

                  {result.leave > 0 && (
                    <span className="rounded-full bg-[#eef4ff] px-2 py-1 text-[9px] font-bold text-[#276bd5]">
                      مرخصی {duration(result.leave)}
                    </span>
                  )}
                </div>
              </div>

              <StatusBadge success={result.balance >= 0}>
                {result.balance >= 0
                  ? `+${duration(result.balance)}`
                  : `−${duration(Math.abs(result.balance))}`}
              </StatusBadge>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <InfoRow
                label="ورود"
                value={record.start ? faDigits(record.start) : "—"}
                valueClassName="tabular-nums"
              />

              <InfoRow
                label="خروج"
                value={record.end ? faDigits(record.end) : "—"}
                valueClassName="tabular-nums"
              />
            </div>

            <div className="mt-2 grid gap-2">
              <InfoRow label="کارکرد خالص" value={duration(result.worked)} />

              <InfoRow
                label="ناهار"
                value={
                  <span>
                    {duration(record.lunchMinutes)}

                    <small
                      className={cn(
                        "mr-2 text-[9px] font-medium",
                        record.lunchPaid ? "text-[#079b60]" : "text-[#6c7d89]",
                      )}
                    >
                      {record.lunchPaid ? "با حقوق" : "بدون حقوق"}
                    </small>
                  </span>
                }
              />

              <InfoRow
                label="وقفه‌ها"
                value={
                  record.breaks.length > 0
                    ? `${duration(result.breakMinutes)} · ${faDigits(
                        String(record.breaks.length),
                      )} مورد`
                    : "بدون وقفه"
                }
              />

              <InfoRow
                label="حقوق روز"
                value={`${financialsHidden ? "••••••" : money(earnedAmount)} تومان`}
                valueClassName="text-[#079b60]"
              />
            </div>

            {record.note && (
              <div className="mt-3 rounded-xl border border-[#e7efed] bg-white px-3 py-3">
                <span className="block text-[9px] text-[#6c7d89]">توضیح</span>

                <p className="mt-1 text-[11px] leading-6 text-[#2e4856]">
                  {record.note}
                </p>
              </div>
            )}
          </article>
        );
      })}

      <article className="rounded-2xl border border-[#cfe6de] bg-[#edf9f4] p-4">
        <strong className="block text-sm font-extrabold text-[#102a3a]">
          جمع این ماه
        </strong>

        <div className="mt-3 grid gap-2">
          <InfoRow label="کارکرد خالص" value={duration(totals.worked)} />

          <InfoRow label="استراحت" value={duration(totals.rest)} />

          <InfoRow label="مرخصی" value={duration(totals.leave)} />

          <InfoRow
            label="تراز"
            value={duration(totals.balance, true)}
            valueClassName={
              totals.balance >= 0 ? "text-[#079b60]" : "text-[#e54845]"
            }
          />

          <InfoRow
            label="حقوق تخمینی"
            value={`${financialsHidden ? "••••••" : money(totals.income)} تومان`}
            valueClassName="text-[#079b60]"
          />
        </div>
      </article>
    </div>
  );
}

