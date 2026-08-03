import { Clock3, Tag, WalletCards } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { PrivateMoney } from "@/components/common/private-money";
import { duration, entryMinutes, fa, localDateKey } from "@/lib/format";
import { calculateEmployeeDayPay } from "@/lib/payroll";
import type { ReturnTypeCalc } from "@/lib/type-helpers";
import type { AppData, WorkRecord } from "@/lib/types";

export function TodayMetrics({
  data,
  record,
  selectedDate,
  result,
  dailyTarget,
  financialsHidden,
}: {
  data: AppData;
  record: WorkRecord;
  selectedDate: string;
  result: ReturnTypeCalc;
  dailyTarget: number;
  financialsHidden: boolean;
}) {
  const progress = Math.min(100, Math.round(result.credited / dailyTarget * 100));
  const todayEntries = data.timeEntries.filter(
    (entry) => localDateKey(new Date(entry.startedAt)) === selectedDate,
  );
  const projectMinutes = todayEntries.reduce((sum, entry) => sum + entryMinutes(entry), 0);
  const billableMinutes = todayEntries.reduce(
    (sum, entry) => sum + (entry.billable ? entryMinutes(entry) : 0),
    0,
  );
  const projectIncome = todayEntries.reduce(
    (sum, entry) => sum + (entry.billable ? entryMinutes(entry) / 60 * entry.effectiveRate : 0),
    0,
  );
  const employeeIncome = calculateEmployeeDayPay({
    monthlySalary: data.settings.salary,
    creditedMinutes: result.credited,
    dailyTargetMinutes: dailyTarget,
    overtimeMultiplier: data.settings.overtimeMultiplier,
    holidayMultiplier: data.settings.holidayMultiplier,
    holiday: record.holiday,
  });
  const isEmployee = data.settings.mode === "employee";
  const isHybrid = data.settings.mode === "hybrid";
  const income = isEmployee ? employeeIncome : isHybrid ? employeeIncome + projectIncome : projectIncome;

  return (
    <section className="mb-[18px] grid grid-cols-4 gap-3 max-[1180px]:grid-cols-2 max-[620px]:grid-cols-1">
      <MetricCard icon={<Clock3 />} label="کارکرد خالص امروز" value={duration(result.worked)} suffix="ساعت" />
      <MetricCard
        icon={<Tag />}
        label={isEmployee ? "زمان قابل محاسبه" : "قابل صورتحساب"}
        value={duration(isEmployee ? result.credited : billableMinutes)}
        suffix="ساعت"
      />
      <MetricCard
        icon={<WalletCards />}
        label={isEmployee ? "حقوق امروز" : isHybrid ? "درآمد ترکیبی امروز" : "درآمد پروژه امروز"}
        value={<PrivateMoney value={income} hidden={financialsHidden} />}
        suffix="تومان"
        tone="blue"
      />
      <article className="flex min-h-28 items-center justify-center gap-4 rounded-[15px] border border-[#dfe7e9] bg-white/95 px-[23px] py-[18px] shadow-[0_10px_35px_rgba(17,45,55,.055)] max-[620px]:min-h-24 [&>div]:grid [&>div]:min-w-0 [&>div]:gap-0.5 [&>div:last-child>strong]:text-lg [&>div:last-child>strong>span]:text-[11px] [&>div:last-child>strong>span]:font-medium [&>div:last-child>strong>span]:text-[#6c7d89] [&_small]:text-[11px] [&_small]:text-[#6c7d89]">
        <div
          className="relative grid h-[72px] w-[72px] place-items-center rounded-full bg-[conic-gradient(#079b60_var(--p),#e6f0ed_0)] before:absolute before:inset-[7px] before:rounded-full before:bg-white before:content-[''] [&_strong]:relative [&_strong]:z-[1] [&_strong]:text-lg"
          style={{ "--p": `${progress * 3.6}deg` } as React.CSSProperties}
        >
          <strong>{fa.format(progress)}٪</strong>
        </div>
        <div>
          <small>هدف روزانه</small>
          <strong>{duration(result.credited)} <span>از {duration(dailyTarget)}</span></strong>
          {!isEmployee && <span className="text-[10px] text-[#6c7d89]">کل پروژه: {duration(projectMinutes)}</span>}
        </div>
      </article>
    </section>
  );
}
