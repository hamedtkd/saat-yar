"use client";

import { useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  BriefcaseBusiness,
  WalletCards,
} from "lucide-react";

import { PanelHead } from "@/components/common/panel-head";
import { cn } from "@/lib/cn";
import {
  duration,
  entryMinutes,
  fa,
  money,
} from "@/lib/format";
import {
  calc,
  timeToMinutes,
} from "@/lib/time-engine";
import type {
  Mode,
  Settings,
  TimeEntry,
  WorkRecord,
} from "@/lib/types";

type MonthStats = {
  worked: number;
  target: number;
  balance: number;
  breaks: number;
};

type ReportChartsProps = {
  mode: Mode;
  entries: TimeEntry[];
  reportBillable: number;
  monthRecords: WorkRecord[];
  monthStats: MonthStats;
  settings: Settings;
};

type FreelancerChartItem = {
  key: string;
  day: string;
  fullDate: string;
  minutes: number;
  income: number;
};

type EmployeeChartItem = {
  key: string;
  day: string;
  fullDate: string;
  worked: number;
  target: number;
  balance: number;
};

type FreelancerTooltipPayloadItem = {
  dataKey?: string;
  name?: string;
  value?: number;
  payload?: FreelancerChartItem;
};

type EmployeeTooltipPayloadItem = {
  dataKey?: string;
  name?: string;
  value?: number;
  payload?: EmployeeChartItem;
};

type BillingTooltipPayloadItem = {
  name?: string;
  value?: number;
  payload?: {
    name: string;
    value: number;
    color: string;
  };
};

type FreelancerTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: FreelancerTooltipPayloadItem[];
};

type EmployeeTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: EmployeeTooltipPayloadItem[];
};

type DonutTooltipProps = {
  active?: boolean;
  payload?: BillingTooltipPayloadItem[];
};

const WEEKDAY_LABELS = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه",
];

const CHART_COLORS = {
  worked: "#079b60",
  target: "#3478e5",
  overtime: "#079b60",
  deficit: "#e54845",
  remaining: "#dfe7e9",

  time: "#079b60",
  income: "#3478e5",
  billable: "#079b60",
  nonBillable: "#f1c65f",
};

function localDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function parseLocalDate(value: string) {
  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return new Date(value);
  }

  return date;
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function compactMoney(value: number) {
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 1_000_000_000) {
    return `${fa.format(
      Math.round(value / 1_000_000_000),
    )} میلیارد`;
  }

  if (absoluteValue >= 1_000_000) {
    return `${fa.format(
      Math.round(value / 1_000_000),
    )} میلیون`;
  }

  if (absoluteValue >= 1_000) {
    return `${fa.format(
      Math.round(value / 1_000),
    )} هزار`;
  }

  return fa.format(Math.round(value));
}

function getDailyTarget(settings: Settings) {
  return Math.max(
    1,
    timeToMinutes(settings.defaultEnd) -
      timeToMinutes(settings.defaultStart) -
      settings.lunchMinutes,
  );
}

function FreelancerWeeklyTooltip({
  active,
  label,
  payload,
}: FreelancerTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const chartItem = payload[0]?.payload;

  const minutes =
    payload.find((item) => item.dataKey === "minutes")
      ?.value ?? 0;

  const income =
    payload.find((item) => item.dataKey === "income")
      ?.value ?? 0;

  return (
    <div
      dir="rtl"
      className={cn(
        "min-w-48 rounded-xl border border-[#dfe7e9]",
        "bg-white/98 p-3",
        "shadow-[0_16px_45px_rgba(17,45,55,0.16)]",
        "backdrop-blur-xl",
      )}
    >
      <div className="mb-2 border-b border-[#edf2f3] pb-2">
        <strong className="block text-xs font-extrabold text-[#102a3a]">
          {label}
        </strong>

        {chartItem?.fullDate && (
          <span className="mt-1 block text-[10px] text-[#6c7d89]">
            {chartItem.fullDate}
          </span>
        )}
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-5">
          <span className="flex items-center gap-2 text-[11px] text-[#526b75]">
            <i
              className="size-2 rounded-full"
              style={{
                backgroundColor: CHART_COLORS.time,
              }}
            />
            زمان ثبت‌شده
          </span>

          <strong
            dir="ltr"
            className="text-xs font-extrabold text-[#102a3a]"
          >
            {duration(minutes)}
          </strong>
        </div>

        <div className="flex items-center justify-between gap-5">
          <span className="flex items-center gap-2 text-[11px] text-[#526b75]">
            <i
              className="size-2 rounded-full"
              style={{
                backgroundColor: CHART_COLORS.income,
              }}
            />
            درآمد
          </span>

          <strong className="text-xs font-extrabold text-[#102a3a]">
            {money(income)} تومان
          </strong>
        </div>
      </div>
    </div>
  );
}

function EmployeeDailyTooltip({
  active,
  label,
  payload,
}: EmployeeTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const chartItem = payload[0]?.payload;

  const worked =
    payload.find((item) => item.dataKey === "worked")
      ?.value ?? 0;

  const target =
    payload.find((item) => item.dataKey === "target")
      ?.value ?? 0;

  const balance = worked - target;

  return (
    <div
      dir="rtl"
      className={cn(
        "min-w-48 rounded-xl border border-[#dfe7e9]",
        "bg-white/98 p-3",
        "shadow-[0_16px_45px_rgba(17,45,55,0.16)]",
        "backdrop-blur-xl",
      )}
    >
      <div className="mb-2 border-b border-[#edf2f3] pb-2">
        <strong className="block text-xs font-extrabold text-[#102a3a]">
          {label}
        </strong>

        {chartItem?.fullDate && (
          <span className="mt-1 block text-[10px] text-[#6c7d89]">
            {chartItem.fullDate}
          </span>
        )}
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-5">
          <span className="flex items-center gap-2 text-[11px] text-[#526b75]">
            <i
              className="size-2 rounded-full"
              style={{
                backgroundColor: CHART_COLORS.worked,
              }}
            />
            کارکرد خالص
          </span>

          <strong
            dir="ltr"
            className="text-xs font-extrabold text-[#102a3a]"
          >
            {duration(worked)}
          </strong>
        </div>

        <div className="flex items-center justify-between gap-5">
          <span className="flex items-center gap-2 text-[11px] text-[#526b75]">
            <i
              className="size-2 rounded-full"
              style={{
                backgroundColor: CHART_COLORS.target,
              }}
            />
            ساعت موظفی
          </span>

          <strong
            dir="ltr"
            className="text-xs font-extrabold text-[#102a3a]"
          >
            {duration(target)}
          </strong>
        </div>

        <div className="flex items-center justify-between gap-5 border-t border-[#edf2f3] pt-2">
          <span className="text-[11px] text-[#526b75]">
            تراز روز
          </span>

          <strong
            dir="ltr"
            className={cn(
              "text-xs font-extrabold",
              balance >= 0
                ? "text-[#079b60]"
                : "text-[#e54845]",
            )}
          >
            {duration(balance, true)}
          </strong>
        </div>
      </div>
    </div>
  );
}

function DonutTooltip({
  active,
  payload,
}: DonutTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0];

  return (
    <div
      dir="rtl"
      className={cn(
        "rounded-xl border border-[#dfe7e9]",
        "bg-white/98 px-3 py-2",
        "shadow-[0_16px_45px_rgba(17,45,55,0.16)]",
      )}
    >
      <div className="flex items-center gap-2">
        <i
          className="size-2 rounded-full"
          style={{
            backgroundColor:
              item.payload?.color ??
              CHART_COLORS.billable,
          }}
        />

        <span className="text-[11px] text-[#526b75]">
          {item.name}
        </span>

        <strong
          dir="ltr"
          className="mr-3 text-xs font-extrabold text-[#102a3a]"
        >
          {duration(item.value ?? 0)}
        </strong>
      </div>
    </div>
  );
}

function EmployeeCharts({
  monthRecords,
  monthStats,
  settings,
}: {
  monthRecords: WorkRecord[];
  monthStats: MonthStats;
  settings: Settings;
}) {
  const dailyTarget = getDailyTarget(settings);

  const employeeData = useMemo<EmployeeChartItem[]>(() => {
    return [...monthRecords]
      .sort((first, second) =>
        first.date.localeCompare(second.date),
      )
      .map((record) => {
        const date = parseLocalDate(record.date);
        const result = calc(record, dailyTarget);

        return {
          key: record.date,
          day: fa.format(date.getDate()),
          fullDate: formatShortDate(date),
          worked: result.worked,
          target: result.target,
          balance: result.balance,
        };
      });
  }, [dailyTarget, monthRecords]);

  const hasData = employeeData.length > 0;

  const overtime = Math.max(0, monthStats.balance);
  const deficit = Math.max(0, -monthStats.balance);

  const completedMinutes = Math.min(
    monthStats.worked,
    monthStats.target,
  );

  const remainingMinutes = Math.max(
    0,
    monthStats.target - monthStats.worked,
  );

  const performanceRatio =
    monthStats.target > 0
      ? Math.round(
          (monthStats.worked / monthStats.target) *
            100,
        )
      : 0;

  const performanceData =
    monthStats.balance >= 0
      ? [
          {
            name: "ساعت موظفی تکمیل‌شده",
            value: completedMinutes,
            color: CHART_COLORS.target,
          },
          {
            name: "اضافه‌کاری",
            value: overtime,
            color: CHART_COLORS.overtime,
          },
        ]
      : [
          {
            name: "کارکرد انجام‌شده",
            value: completedMinutes,
            color: CHART_COLORS.worked,
          },
          {
            name: "کسری کار",
            value: deficit || remainingMinutes,
            color: CHART_COLORS.deficit,
          },
        ];

  return (
    <section
      className={cn(
        "mb-4 grid gap-4",
        "grid-cols-[minmax(0,1.8fr)_minmax(290px,0.6fr)]",
        "max-[1050px]:grid-cols-1",
      )}
    >
      <article
        className={cn(
          "min-w-0 rounded-2xl border border-[#dfe7e9]",
          "bg-white/95 p-4",
          "shadow-[0_12px_38px_rgba(17,45,55,0.055)]",
          "sm:p-5",
        )}
      >
        <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
          <PanelHead
            icon={<BarChart3 />}
            title="کارکرد روزانه در برابر موظفی"
          />

          <span className="rounded-full bg-[#f1f7f5] px-3 py-1.5 text-[10px] font-bold text-[#526b75]">
            ماه جاری
          </span>
        </div>

        <p className="mb-4 text-[10px] leading-6 text-[#6c7d89]">
          ستون سبز کارکرد خالص و خط آبی ساعت موظفی هر
          روز را نشان می‌دهد.
        </p>

        {hasData ? (
          <div className="h-[320px] w-full min-w-0">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <ComposedChart
                data={employeeData}
                margin={{
                  top: 12,
                  right: 4,
                  bottom: 2,
                  left: 4,
                }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="#edf2f3"
                  strokeDasharray="4 5"
                />

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#6c7d89",
                    fontSize: 10,
                    fontFamily: "inherit",
                  }}
                  tickMargin={12}
                  minTickGap={8}
                />

                <YAxis
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  width={52}
                  tick={{
                    fill: "#6c7d89",
                    fontSize: 9,
                    fontFamily: "inherit",
                  }}
                  tickFormatter={(value: number) =>
                    duration(value)
                  }
                />

                <Tooltip
                  cursor={{
                    fill: "rgba(7,155,96,0.045)",
                    radius: 10,
                  }}
                  content={<EmployeeDailyTooltip />}
                />

                <Legend
                  verticalAlign="top"
                  align="left"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{
                    direction: "rtl",
                    fontSize: 11,
                    paddingBottom: 18,
                    color: "#526b75",
                  }}
                  formatter={(value: string) => (
                    <span className="mr-1 text-[11px] font-semibold text-[#526b75]">
                      {value}
                    </span>
                  )}
                />

                <Bar
                  dataKey="worked"
                  name="کارکرد خالص"
                  fill={CHART_COLORS.worked}
                  radius={[7, 7, 2, 2]}
                  maxBarSize={28}
                />

                <Line
                  type="monotone"
                  dataKey="target"
                  name="ساعت موظفی"
                  stroke={CHART_COLORS.target}
                  strokeWidth={3}
                  dot={{
                    r: 3,
                    fill: "#ffffff",
                    stroke: CHART_COLORS.target,
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 5,
                    fill: CHART_COLORS.target,
                    stroke: "#ffffff",
                    strokeWidth: 3,
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="grid min-h-[320px] place-items-center rounded-xl border border-dashed border-[#d7e2e4] bg-[#fbfdfc] p-6 text-center">
            <div>
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#edf9f4] text-[#079b60]">
                <BriefcaseBusiness className="size-5" />
              </span>

              <strong className="mt-3 block text-sm font-extrabold text-[#173747]">
                هنوز کارکردی ثبت نشده است
              </strong>

              <p className="mt-1 text-[10px] leading-6 text-[#6c7d89]">
                بعد از ثبت ورود و خروج، نمودار کارکرد روزانه
                اینجا نمایش داده می‌شود.
              </p>
            </div>
          </div>
        )}
      </article>

      <article
        className={cn(
          "min-w-0 rounded-2xl border border-[#dfe7e9]",
          "bg-white/95 p-4",
          "shadow-[0_12px_38px_rgba(17,45,55,0.055)]",
          "sm:p-5",
        )}
      >
        <PanelHead
          icon={<BriefcaseBusiness />}
          title="وضعیت کارکرد ماه"
        />

        <p className="mb-2 text-[10px] leading-6 text-[#6c7d89]">
          نسبت کارکرد ثبت‌شده به ساعت موظفی ماه
        </p>

        <div className="relative h-[230px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Tooltip content={<DonutTooltip />} />

              <Pie
                data={performanceData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="48%"
                innerRadius={64}
                outerRadius={88}
                startAngle={90}
                endAngle={-270}
                paddingAngle={3}
                cornerRadius={8}
                stroke="none"
              >
                {performanceData.map((item) => (
                  <Cell
                    key={item.name}
                    fill={item.color}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="-translate-y-1 text-center">
              <strong className="block text-3xl font-black text-[#102a3a]">
                {fa.format(performanceRatio)}٪
              </strong>

              <span className="mt-1 block text-[9px] text-[#6c7d89]">
                تحقق موظفی
              </span>
            </div>
          </div>
        </div>

        <div className="mt-1 grid gap-2">
          {performanceData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-3 rounded-xl bg-[#f8fbfa] px-3 py-2.5"
            >
              <span className="flex min-w-0 items-center gap-2 text-[11px] font-semibold text-[#526b75]">
                <i
                  className="size-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
                {item.name}
              </span>

              <strong
                dir="ltr"
                className="text-xs font-extrabold text-[#102a3a]"
              >
                {duration(item.value)}
              </strong>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[#edf2f3] pt-3">
          <span className="text-[10px] font-semibold text-[#6c7d89]">
            تراز نهایی ماه
          </span>

          <strong
            dir="ltr"
            className={cn(
              "text-sm font-extrabold",
              monthStats.balance >= 0
                ? "text-[#079b60]"
                : "text-[#e54845]",
            )}
          >
            {duration(monthStats.balance, true)}
          </strong>
        </div>
      </article>
    </section>
  );
}

function FreelancerCharts({
  entries,
  reportBillable,
}: {
  entries: TimeEntry[];
  reportBillable: number;
}) {
  const weeklyData = useMemo<
    FreelancerChartItem[]
  >(() => {
    const now = new Date();

    const days = Array.from(
      { length: 7 },
      (_, index) => {
        const date = new Date(now);

        date.setHours(12, 0, 0, 0);
        date.setDate(now.getDate() - (6 - index));

        return {
          key: localDateKey(date),
          date,
          day: WEEKDAY_LABELS[date.getDay()],
          fullDate: formatShortDate(date),
          minutes: 0,
          income: 0,
        };
      },
    );

    const daysByKey = new Map(
      days.map((item) => [item.key, item]),
    );

    for (const entry of entries) {
      const startedDate = new Date(entry.startedAt);

      const day = daysByKey.get(
        localDateKey(startedDate),
      );

      if (!day) {
        continue;
      }

      const minutes = entryMinutes(entry);

      day.minutes += minutes;

      if (entry.billable) {
        day.income +=
          (minutes / 60) *
          Math.max(0, entry.effectiveRate);
      }
    }

    return days.map(
      ({ date: _date, ...item }) => item,
    );
  }, [entries]);

  const allMinutes = useMemo(
    () =>
      entries.reduce(
        (sum, entry) =>
          sum + entryMinutes(entry),
        0,
      ),
    [entries],
  );

  const nonBillable = Math.max(
    0,
    allMinutes - reportBillable,
  );

  const billableRatio =
    allMinutes > 0
      ? Math.round(
          (reportBillable / allMinutes) * 100,
        )
      : 0;

  const billingData = [
    {
      name: "قابل صورتحساب",
      value: reportBillable,
      color: CHART_COLORS.billable,
    },
    {
      name: "غیرقابل صورتحساب",
      value: nonBillable,
      color: CHART_COLORS.nonBillable,
    },
  ];

  const hasWeeklyData = weeklyData.some(
    (item) =>
      item.minutes > 0 || item.income > 0,
  );

  return (
    <section
      className={cn(
        "mb-4 grid gap-4",
        "grid-cols-[minmax(0,1.8fr)_minmax(290px,0.6fr)]",
        "max-[1050px]:grid-cols-1",
      )}
    >
      <article
        className={cn(
          "min-w-0 rounded-2xl border border-[#dfe7e9]",
          "bg-white/95 p-4",
          "shadow-[0_12px_38px_rgba(17,45,55,0.055)]",
          "sm:p-5",
        )}
      >
        <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
          <PanelHead
            icon={<BarChart3 />}
            title="روند زمان و درآمد هفتگی"
          />

          <span className="rounded-full bg-[#f1f7f5] px-3 py-1.5 text-[10px] font-bold text-[#526b75]">
            ۷ روز اخیر
          </span>
        </div>

        <p className="mb-4 text-[10px] leading-6 text-[#6c7d89]">
          ستون سبز زمان ثبت‌شده و خط آبی درآمد
          قابل‌صورتحساب روزانه را نشان می‌دهد.
        </p>

        {hasWeeklyData ? (
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <ComposedChart
                data={weeklyData}
                margin={{
                  top: 12,
                  right: 4,
                  bottom: 2,
                  left: 4,
                }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="#edf2f3"
                  strokeDasharray="4 5"
                />

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#6c7d89",
                    fontSize: 10,
                    fontFamily: "inherit",
                  }}
                  tickMargin={12}
                />

                <YAxis
                  yAxisId="time"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  width={48}
                  tick={{
                    fill: "#6c7d89",
                    fontSize: 9,
                    fontFamily: "inherit",
                  }}
                  tickFormatter={(value: number) =>
                    duration(value)
                  }
                />

                <YAxis
                  yAxisId="income"
                  orientation="left"
                  axisLine={false}
                  tickLine={false}
                  width={58}
                  tick={{
                    fill: "#6c7d89",
                    fontSize: 9,
                    fontFamily: "inherit",
                  }}
                  tickFormatter={compactMoney}
                />

                <Tooltip
                  cursor={{
                    fill: "rgba(7,155,96,0.045)",
                    radius: 10,
                  }}
                  content={
                    <FreelancerWeeklyTooltip />
                  }
                />

                <Legend
                  verticalAlign="top"
                  align="left"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{
                    direction: "rtl",
                    fontSize: 11,
                    paddingBottom: 18,
                    color: "#526b75",
                  }}
                  formatter={(value: string) => (
                    <span className="mr-1 text-[11px] font-semibold text-[#526b75]">
                      {value}
                    </span>
                  )}
                />

                <Bar
                  yAxisId="time"
                  dataKey="minutes"
                  name="زمان ثبت‌شده"
                  fill={CHART_COLORS.time}
                  radius={[7, 7, 2, 2]}
                  maxBarSize={30}
                />

                <Line
                  yAxisId="income"
                  type="monotone"
                  dataKey="income"
                  name="درآمد"
                  stroke={CHART_COLORS.income}
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#ffffff",
                    stroke: CHART_COLORS.income,
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    fill: CHART_COLORS.income,
                    stroke: "#ffffff",
                    strokeWidth: 3,
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="grid min-h-[300px] place-items-center rounded-xl border border-dashed border-[#d7e2e4] bg-[#fbfdfc] p-6 text-center">
            <div>
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#edf9f4] text-[#079b60]">
                <BarChart3 className="size-5" />
              </span>

              <strong className="mt-3 block text-sm font-extrabold text-[#173747]">
                هنوز داده‌ای برای نمودار وجود ندارد
              </strong>

              <p className="mt-1 text-[10px] leading-6 text-[#6c7d89]">
                با ثبت زمان پروژه‌ها، روند هفتگی اینجا
                نمایش داده می‌شود.
              </p>
            </div>
          </div>
        )}
      </article>

      <article
        className={cn(
          "min-w-0 rounded-2xl border border-[#dfe7e9]",
          "bg-white/95 p-4",
          "shadow-[0_12px_38px_rgba(17,45,55,0.055)]",
          "sm:p-5",
        )}
      >
        <PanelHead
          icon={<WalletCards />}
          title="خلاصه صورتحساب"
        />

        <p className="mb-2 text-[10px] leading-6 text-[#6c7d89]">
          سهم زمان قابل‌صورتحساب از کل زمان پروژه‌ها
        </p>

        <div className="relative h-[230px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Tooltip content={<DonutTooltip />} />

              <Pie
                data={billingData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="48%"
                innerRadius={64}
                outerRadius={88}
                startAngle={90}
                endAngle={-270}
                paddingAngle={
                  allMinutes > 0 ? 3 : 0
                }
                cornerRadius={8}
                stroke="none"
              >
                {billingData.map((item) => (
                  <Cell
                    key={item.name}
                    fill={item.color}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="-translate-y-1 text-center">
              <strong className="block text-3xl font-black text-[#102a3a]">
                {fa.format(billableRatio)}٪
              </strong>

              <span className="mt-1 block text-[9px] text-[#6c7d89]">
                قابل صورتحساب
              </span>
            </div>
          </div>
        </div>

        <div className="mt-1 grid gap-2">
          {billingData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-3 rounded-xl bg-[#f8fbfa] px-3 py-2.5"
            >
              <span className="flex min-w-0 items-center gap-2 text-[11px] font-semibold text-[#526b75]">
                <i
                  className="size-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
                {item.name}
              </span>

              <strong
                dir="ltr"
                className="text-xs font-extrabold text-[#102a3a]"
              >
                {duration(item.value)}
              </strong>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[#edf2f3] pt-3">
          <span className="text-[10px] font-semibold text-[#6c7d89]">
            مجموع زمان پروژه‌ها
          </span>

          <strong
            dir="ltr"
            className="text-sm font-extrabold text-[#102a3a]"
          >
            {duration(allMinutes)}
          </strong>
        </div>
      </article>
    </section>
  );
}

export function ReportCharts({
  mode,
  entries,
  reportBillable,
  monthRecords,
  monthStats,
  settings,
}: ReportChartsProps) {
  if (mode === "employee") {
    return (
      <EmployeeCharts
        monthRecords={monthRecords}
        monthStats={monthStats}
        settings={settings}
      />
    );
  }

  return (
    <FreelancerCharts
      entries={entries}
      reportBillable={reportBillable}
    />
  );
}