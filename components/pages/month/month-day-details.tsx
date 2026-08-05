import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, Coffee, Edit3, Palmtree } from "lucide-react";

import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { duration, faDigits, jalali } from "@/lib/format";
import { getHolidayInfo } from "@/lib/holidays";
import { getRecordStatus } from "@/lib/record-health";
import { calc } from "@/lib/time-engine";
import type { AppData } from "@/lib/types";
import { getDailyTargetMinutes } from "@/lib/work-schedule";

export function MonthDayDetails({ data, selectedDate }: { data: AppData; selectedDate: string }) {
  const stored = data.records[selectedDate];
  const leave = data.leaves.find((item) => item.startDate <= selectedDate && item.endDate >= selectedDate);
  const holiday = getHolidayInfo(selectedDate, {
    mode: data.settings.mode,
    manualHoliday: stored?.holiday,
    includeOfficialHolidays: data.settings.autoOfficialHolidays,
    includeWeeklyHoliday: data.settings.autoWeeklyHoliday,
    overrides: data.holidayOverrides,
  });
  const record = stored ? { ...stored, holiday: holiday.isHoliday } : null;
  const target = holiday.isHoliday ? 0 : getDailyTargetMinutes(selectedDate, data.settings);
  const result = record ? calc(record, target) : null;
  const health = record ? getRecordStatus(record) : null;

  return (
    <article className="rounded-[var(--card-radius)] border border-[var(--border)] bg-[var(--surface-1)] p-5 shadow-[0_10px_35px_rgba(17,45,55,.055)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm font-extrabold text-[var(--text)]">
            <CalendarDays className="size-4 text-[var(--accent-strong)]" />
            جزئیات روز انتخاب‌شده
          </div>
          <strong className="text-base font-black text-[var(--text)]">{jalali(selectedDate, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</strong>
          <div className="mt-2 flex flex-wrap gap-2">
            {holiday.isHoliday && <StatusBadge success={false}>{holiday.title || "روز تعطیل"}</StatusBadge>}
            {leave && <span className="rounded-full bg-[var(--info-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--info)]">مرخصی ثبت‌شده</span>}
            {health && <StatusBadge success={health.state === "complete"}>{health.label}</StatusBadge>}
          </div>
        </div>
        <Button asChild>
          <Link href="/today"><Edit3 className="size-4" /> ویرایش این روز</Link>
        </Button>
      </div>

      {record ? (
        <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
          <Detail icon={<Clock3 />} label="ورود و خروج" value={`${faDigits(record.start || "—")} تا ${faDigits(record.end || "—")}`} />
          <Detail icon={<CheckCircle2 />} label="کارکرد خالص" value={duration(result?.worked ?? 0)} />
          <Detail icon={<Coffee />} label="ناهار و وقفه" value={duration((result?.breakMinutes ?? 0) + (result?.unpaidLunchMinutes ?? 0))} />
          <Detail
            icon={(result?.balance ?? 0) >= 0 ? <CheckCircle2 /> : <AlertTriangle />}
            label="تراز روز"
            value={duration(result?.balance ?? 0, true)}
            tone={(result?.balance ?? 0) >= 0 ? "green" : "red"}
          />
        </div>
      ) : (
        <div className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] text-center">
          {leave ? <Palmtree className="size-5 text-[var(--info)]" /> : <Clock3 className="size-5 text-[var(--text-muted)]" />}
          <strong className="text-xs text-[var(--text)]">برای این روز هنوز رکورد کاری ثبت نشده است.</strong>
          <span className="text-[10px] text-[var(--text-muted)]">از دکمه ویرایش، ساعت‌ها یا مرخصی روز را ثبت کن.</span>
        </div>
      )}

      {health && health.issues.length > 0 && (
        <div className="mt-3 rounded-xl border border-[color-mix(in_srgb,var(--warning)_30%,var(--border))] bg-[var(--warning-soft)] p-3 text-[10px] leading-6 text-[var(--warning)]">
          {health.issues.map((issue) => <div key={`${issue.code}-${issue.message}`}>• {issue.message}</div>)}
        </div>
      )}
    </article>
  );
}

function Detail({ icon, label, value, tone = "default" }: { icon: ReactNode; label: string; value: string; tone?: "default" | "green" | "red" }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
      <div className="mb-2 flex items-center gap-2 text-[10px] text-[var(--text-muted)]">{icon}{label}</div>
      <strong dir="ltr" className={cn("block text-right text-sm font-black text-[var(--text)]", tone === "green" && "text-[var(--accent-strong)]", tone === "red" && "text-[var(--danger)]")}>{value}</strong>
    </div>
  );
}
