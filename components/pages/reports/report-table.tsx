import type { ReactNode } from "react";
import {
  BarChart3,
  Check,
  FileSpreadsheet,
  Filter,
  Printer,
} from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { duration, entryMinutes, faDigits, jalali, money } from "@/lib/format";
import { calculateEmployeeDayPay } from "@/lib/payroll";
import { calc, timeToMinutes } from "@/lib/time-engine";
import type {
  AppData,
  Mode,
  Settings,
  TimeEntry,
  WorkRecord,
} from "@/lib/types";

type ReportTableProps = {
  mode: Mode;
  data: AppData;
  entries: TimeEntry[];
  monthRecords: WorkRecord[];
  settings?: Settings;
};

type EmployeeReportTableProps = {
  monthRecords: WorkRecord[];
  settings: Settings;
};

type FreelancerReportTableProps = {
  data: AppData;
  entries: TimeEntry[];
};

type PrintPreviewAsideProps = {
  mode: Mode;
};

type InfoRowProps = {
  label: string;
  value: ReactNode;
  valueClassName?: string;
  className?: string;
};

type EmployeeTotals = {
  worked: number;
  leave: number;
  balance: number;
  rest: number;
  income: number;
};

const EMPLOYEE_HEADINGS = [
  "تاریخ",
  "ورود",
  "خروج",
  "ناهار",
  "وقفه‌ها",
  "کارکرد خالص",
  "مرخصی",
  "تراز",
  "حقوق روز",
  "توضیح",
];

const FREELANCER_HEADINGS = [
  "تاریخ",
  "مشتری",
  "پروژه",
  "شرح",
  "مدت",
  "نرخ مؤثر",
  "مبلغ",
  "وضعیت",
];

function InfoRow({ label, value, valueClassName, className }: InfoRowProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center justify-between gap-4",
        "rounded-xl border border-[#e7efed]",
        "bg-white px-3 py-3",
        className,
      )}
    >
      <span className="shrink-0 text-[10px] font-medium text-[#6c7d89]">
        {label}
      </span>

      <strong
        className={cn(
          "min-w-0 text-left text-xs font-extrabold text-[#102a3a]",
          valueClassName,
        )}
      >
        {value}
      </strong>
    </div>
  );
}

function TableHeading({ children }: { children: ReactNode }) {
  return (
    <th
      className={cn(
        "h-11 whitespace-nowrap",
        "border-y border-[#edf1f2]",
        "bg-[#fbfcfc] px-3 py-2",
        "text-right font-semibold text-[#536975]",
      )}
    >
      {children}
    </th>
  );
}

function getDailyTarget(settings: Settings) {
  return Math.max(
    1,
    timeToMinutes(settings.defaultEnd) -
      timeToMinutes(settings.defaultStart) -
      settings.lunchMinutes,
  );
}

function getEmployeeDayPay({
  record,
  settings,
  dailyTarget,
}: {
  record: WorkRecord;
  settings: Settings;
  dailyTarget: number;
}) {
  const result = calc(record, dailyTarget);

  return calculateEmployeeDayPay({
    monthlySalary: settings.salary,
    creditedMinutes: result.credited,
    dailyTargetMinutes: dailyTarget,
    overtimeMultiplier: settings.overtimeMultiplier,
    holidayMultiplier: settings.holidayMultiplier,
    holiday: record.holiday,
  });
}

function getEmployeeTotals(
  records: WorkRecord[],
  settings: Settings,
  dailyTarget: number,
): EmployeeTotals {
  return records.reduce<EmployeeTotals>(
    (totals, record) => {
      const result = calc(record, dailyTarget);

      totals.worked += result.worked;
      totals.leave += result.leave;
      totals.balance += result.balance;
      totals.rest += result.breakMinutes + record.lunchMinutes;
      totals.income += getEmployeeDayPay({
        record,
        settings,
        dailyTarget,
      });

      return totals;
    },
    {
      worked: 0,
      leave: 0,
      balance: 0,
      rest: 0,
      income: 0,
    },
  );
}

function EmployeeDesktopTable({
  monthRecords,
  settings,
  dailyTarget,
  totals,
}: EmployeeReportTableProps & {
  dailyTarget: number;
  totals: EmployeeTotals;
}) {
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
                  {money(earnedAmount)} تومان
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
              {money(totals.income)} تومان
            </td>

            <td className="border-t border-[#dfe7e9] px-3 py-3" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function EmployeeMobileCards({
  monthRecords,
  settings,
  dailyTarget,
  totals,
}: EmployeeReportTableProps & {
  dailyTarget: number;
  totals: EmployeeTotals;
}) {
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
                value={`${money(earnedAmount)} تومان`}
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
            value={`${money(totals.income)} تومان`}
            valueClassName="text-[#079b60]"
          />
        </div>
      </article>
    </div>
  );
}

function EmployeeReportTable({
  monthRecords,
  settings,
}: EmployeeReportTableProps) {
  const dailyTarget = getDailyTarget(settings);

  const totals = getEmployeeTotals(monthRecords, settings, dailyTarget);

  return (
    <article
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl",
        "border border-[#dfe7e9]",
        "bg-white/95",
        "shadow-[0_10px_35px_rgba(17,45,55,0.055)]",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <PanelHead icon={<FileSpreadsheet />} title="جزئیات کارکرد روزانه" />

        {monthRecords.length > 0 && (
          <span className="rounded-full bg-[#f1f7f5] px-3 py-1.5 text-[10px] font-bold text-[#526b75]">
            {faDigits(String(monthRecords.length))} روز ثبت‌شده
          </span>
        )}
      </div>

      {monthRecords.length > 0 ? (
        <>
          <EmployeeDesktopTable
            monthRecords={monthRecords}
            settings={settings}
            dailyTarget={dailyTarget}
            totals={totals}
          />

          <EmployeeMobileCards
            monthRecords={monthRecords}
            settings={settings}
            dailyTarget={dailyTarget}
            totals={totals}
          />
        </>
      ) : (
        <div className="p-4 sm:p-5">
          <EmptyState
            icon={<Filter />}
            title="هنوز کارکردی ثبت نشده است"
            description="با ثبت ورود و خروج، جزئیات روزهای کاری اینجا نمایش داده می‌شود."
          />
        </div>
      )}
    </article>
  );
}

function FreelancerDesktopTable({ data, entries }: FreelancerReportTableProps) {
  const totalMinutes = entries.reduce(
    (sum, entry) => sum + entryMinutes(entry),
    0,
  );

  const totalIncome = entries.reduce((sum, entry) => {
    if (!entry.billable) {
      return sum;
    }

    return sum + (entryMinutes(entry) / 60) * Math.max(0, entry.effectiveRate);
  }, 0);

  return (
    <div className="hidden w-full overflow-x-auto px-4 pb-5 pt-3 md:block sm:px-5">
      <table className="w-full min-w-245 border-collapse text-[11px]">
        <thead>
          <tr>
            {FREELANCER_HEADINGS.map((heading) => (
              <TableHeading key={heading}>{heading}</TableHeading>
            ))}
          </tr>
        </thead>

        <tbody>
          {entries.map((entry) => {
            const project = data.projects.find(
              (item) => item.id === entry.projectId,
            );

            const client = data.clients.find(
              (item) => item.id === entry.clientId,
            );

            const minutes = entryMinutes(entry);

            const amount = entry.billable
              ? (minutes / 60) * Math.max(0, entry.effectiveRate)
              : 0;

            return (
              <tr
                key={entry.id}
                className="transition-colors hover:bg-[#fbfdfc]"
              >
                <td className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3 text-[#2e4856]">
                  {jalali(entry.startedAt, {
                    day: "numeric",
                    month: "long",
                  })}
                </td>

                <td className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3 text-[#2e4856]">
                  {client?.name || "—"}
                </td>

                <td className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3">
                  <strong className="text-[#102a3a]">
                    {project?.name || "—"}
                  </strong>
                </td>

                <td className="max-w-65 border-b border-[#edf1f2] px-3 py-3 text-[#2e4856]">
                  <span
                    className="block truncate"
                    title={entry.note || entry.task || undefined}
                  >
                    {entry.note || entry.task || "—"}
                  </span>
                </td>

                <td className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3 font-extrabold text-[#102a3a]">
                  {duration(minutes)}
                </td>

                <td className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3 text-[#2e4856]">
                  {money(entry.effectiveRate)} تومان
                </td>

                <td className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3 font-extrabold text-[#102a3a]">
                  {money(amount)} تومان
                </td>

                <td className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3">
                  <StatusBadge success={entry.billable}>
                    {entry.billable ? "قابل صورتحساب" : "غیرقابل صورتحساب"}
                  </StatusBadge>
                </td>
              </tr>
            );
          })}
        </tbody>

        {entries.length > 0 && (
          <tfoot>
            <tr className="bg-[#f8fbfa]">
              <td
                colSpan={4}
                className="border-t border-[#dfe7e9] px-3 py-3 font-extrabold text-[#102a3a]"
              >
                جمع رکوردهای نمایش‌داده‌شده
              </td>

              <td className="border-t border-[#dfe7e9] px-3 py-3 font-extrabold text-[#102a3a]">
                {duration(totalMinutes)}
              </td>

              <td className="border-t border-[#dfe7e9] px-3 py-3" />

              <td className="border-t border-[#dfe7e9] px-3 py-3 font-black text-[#079b60]">
                {money(totalIncome)} تومان
              </td>

              <td className="border-t border-[#dfe7e9] px-3 py-3" />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

function FreelancerMobileCards({ data, entries }: FreelancerReportTableProps) {
  const totalMinutes = entries.reduce(
    (sum, entry) => sum + entryMinutes(entry),
    0,
  );

  const totalIncome = entries.reduce((sum, entry) => {
    if (!entry.billable) {
      return sum;
    }

    return sum + (entryMinutes(entry) / 60) * Math.max(0, entry.effectiveRate);
  }, 0);

  return (
    <div className="grid gap-3 p-4 md:hidden">
      {entries.map((entry) => {
        const project = data.projects.find(
          (item) => item.id === entry.projectId,
        );

        const client = data.clients.find((item) => item.id === entry.clientId);

        const minutes = entryMinutes(entry);

        const amount = entry.billable
          ? (minutes / 60) * Math.max(0, entry.effectiveRate)
          : 0;

        return (
          <article
            key={entry.id}
            className={cn(
              "rounded-2xl border border-[#e2ebe8]",
              "bg-[#fbfdfc] p-4",
              "shadow-[0_6px_20px_rgba(17,45,55,0.035)]",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <strong className="block truncate text-sm font-extrabold text-[#102a3a]">
                  {project?.name || "بدون پروژه"}
                </strong>

                <span className="mt-1 block text-[10px] text-[#6c7d89]">
                  {client?.name || "بدون مشتری"}
                </span>
              </div>

              <StatusBadge success={entry.billable}>
                {entry.billable ? "قابل صورتحساب" : "غیرقابل"}
              </StatusBadge>
            </div>

            <p className="mt-3 text-[10px] text-[#6c7d89]">
              {jalali(entry.startedAt, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>

            <div className="mt-3 grid gap-2">
              <InfoRow label="مدت" value={duration(minutes)} />

              <InfoRow
                label="نرخ مؤثر"
                value={`${money(entry.effectiveRate)} تومان`}
              />

              <InfoRow
                label="مبلغ"
                value={`${money(amount)} تومان`}
                valueClassName={
                  entry.billable ? "text-[#079b60]" : "text-[#6c7d89]"
                }
              />
            </div>

            {(entry.note || entry.task) && (
              <div className="mt-3 rounded-xl border border-[#e7efed] bg-white px-3 py-3">
                <span className="block text-[9px] text-[#6c7d89]">
                  شرح فعالیت
                </span>

                <p className="mt-1 text-[11px] leading-6 text-[#2e4856]">
                  {entry.note || entry.task}
                </p>
              </div>
            )}
          </article>
        );
      })}

      {entries.length > 0 && (
        <article className="rounded-2xl border border-[#cfe6de] bg-[#edf9f4] p-4">
          <strong className="block text-sm font-extrabold text-[#102a3a]">
            جمع رکوردهای نمایش‌داده‌شده
          </strong>

          <div className="mt-3 grid gap-2">
            <InfoRow label="زمان کل" value={duration(totalMinutes)} />

            <InfoRow
              label="درآمد"
              value={`${money(totalIncome)} تومان`}
              valueClassName="text-[#079b60]"
            />
          </div>
        </article>
      )}
    </div>
  );
}

function FreelancerReportTable({ data, entries }: FreelancerReportTableProps) {
  return (
    <article
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl",
        "border border-[#dfe7e9]",
        "bg-white/95",
        "shadow-[0_10px_35px_rgba(17,45,55,0.055)]",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <PanelHead icon={<FileSpreadsheet />} title="جزئیات رکوردهای پروژه" />

        {entries.length > 0 && (
          <span className="rounded-full bg-[#f1f7f5] px-3 py-1.5 text-[10px] font-bold text-[#526b75]">
            {faDigits(String(entries.length))} رکورد
          </span>
        )}
      </div>

      {entries.length > 0 ? (
        <>
          <FreelancerDesktopTable data={data} entries={entries} />

          <FreelancerMobileCards data={data} entries={entries} />
        </>
      ) : (
        <div className="p-4 sm:p-5">
          <EmptyState
            icon={<Filter />}
            title="رکوردی با این فیلتر پیدا نشد"
            description="فیلترها را تغییر بده یا تایمر پروژه را شروع کن."
          />
        </div>
      )}
    </article>
  );
}

function PrintPreviewAside({ mode }: PrintPreviewAsideProps) {
  const isEmployee = mode === "employee";

  const features = isEmployee
    ? [
        "خلاصه حضور و کارکرد",
        "اضافه‌کاری و کسری",
        "جزئیات روزهای کاری",
        "حقوق تخمینی ماه",
      ]
    : [
        "خلاصه زمان و درآمد",
        "نمودارهای تحلیلی",
        "ریز فعالیت‌های پروژه",
        "مناسب چاپ و ذخیره",
      ];

  return (
    <aside
      className={cn(
        "order-last rounded-2xl",
        "border border-[#dfe7e9]",
        "bg-white/95 p-4",
        "shadow-[0_10px_35px_rgba(17,45,55,0.055)]",
        "print:hidden",
      )}
    >
      <PanelHead
        icon={<Printer />}
        title={isEmployee ? "گزارش قابل چاپ" : "آماده ارسال به مشتری"}
      />

      <div
        className={cn(
          "mx-auto my-5 grid h-44 w-34",
          "place-items-start justify-center gap-3",
          "rounded-sm border border-[#dfe7e9]",
          "bg-white p-5",
          "shadow-[0_10px_24px_rgba(17,45,55,0.1)]",
        )}
      >
        <div className="flex w-full items-center justify-between">
          <BarChart3 className="size-8 text-[#079b60]" />

          <span className="rounded-full bg-[#edf9f4] px-2 py-1 text-[7px] font-bold text-[#079b60]">
            PDF
          </span>
        </div>

        <span className="h-1 w-20 rounded-full bg-[#dfe6e7]" />
        <span className="h-1 w-16 rounded-full bg-[#e8edef]" />

        <i
          className={cn(
            "h-10 w-20 rounded-md",
            "bg-[linear-gradient(90deg,#079b60_28%,#dfe9e6_28%_39%,#276bd5_39%_62%,#dfe9e6_62%)]",
          )}
        />
      </div>

      <ul className="m-0 list-none p-0">
        {features.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 py-1.5 text-[10px] text-[#6c7d89]"
          >
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#edf9f4]">
              <Check className="size-3 text-[#079b60]" />
            </span>

            {item}
          </li>
        ))}
      </ul>

      <Button
        type="button"
        className="mt-4 h-11 w-full rounded-xl bg-[#0b4556] hover:bg-[#083b49]"
        onClick={() => window.print()}
      >
        <Printer className="size-4" />
        پیش‌نمایش چاپ
      </Button>
    </aside>
  );
}

export function ReportTable({
  mode,
  data,
  entries,
  monthRecords,
  settings = data.settings,
}: ReportTableProps) {
  const isEmployee = mode === "employee";

  return (
    <section
      className={cn(
        "grid gap-4",
        "grid-cols-[minmax(0,1fr)_18.75rem]",
        "max-[1180px]:grid-cols-[minmax(0,1fr)_17.5rem]",
        "max-[900px]:grid-cols-1",
      )}
    >
      {isEmployee ? (
        <EmployeeReportTable monthRecords={monthRecords} settings={settings} />
      ) : (
        <FreelancerReportTable data={data} entries={entries} />
      )}

      <PrintPreviewAside mode={mode} />
    </section>
  );
}
