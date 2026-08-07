import { CalendarPlus2, CheckCircle2, Clock3, History, Umbrella } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeading } from "@/components/common/page-heading";
import { SectionHeading } from "@/components/common/section-heading";
import { cn } from "@/lib/cn";
import { duration } from "@/lib/format";
import type { AppData, LeaveEntry } from "@/lib/types";
import { LeaveForm } from "./leave-form";
import { LeaveTable } from "./leave-table";

export function LeavePage({ data, setData, draft, setDraft, saveLeave, used, available }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  draft: LeaveEntry;
  setDraft: React.Dispatch<React.SetStateAction<LeaveEntry>>;
  saveLeave: () => void;
  used: number;
  available: number;
}) {
  return (
    <>
      <PageHeading title="مرخصی‌های من" description="سهمیه، درخواست‌های شخصی و تاریخچه مرخصی را در یک جریان ساده مدیریت کن." />

      <section className="mb-5">
        <SectionHeading
          icon={<Umbrella />}
          eyebrow="وضعیت سهمیه"
          title="نمای کلی مرخصی"
          description="مصرف و مانده سهمیه را قبل از ثبت درخواست جدید ببین."
        />
        <div className={cn("grid gap-3", "grid-cols-3 max-[620px]:grid-cols-1")}>
          <MetricCard icon={<Umbrella />} label="سهمیه کل" value={duration(data.settings.leaveBalanceMinutes + data.settings.monthlyLeaveMinutes)} suffix="ساعت" tone="blue" />
          <MetricCard icon={<Clock3 />} label="مصرف‌شده" value={duration(used)} suffix="ساعت" tone="amber" />
          <MetricCard icon={<CheckCircle2 />} label="مانده مرخصی" value={duration(available)} suffix="ساعت" />
        </div>
      </section>

      <section>
        <SectionHeading
          icon={<CalendarPlus2 />}
          eyebrow="ثبت و پیگیری"
          title="درخواست‌ها و تاریخچه"
          description="درخواست جدید را ثبت کن یا موردهای قبلی را ویرایش و مرور کن."
          trailing={<span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-[10px] font-bold text-[var(--text-muted)]"><History className="size-3.5 text-[var(--accent-strong)]" /> تاریخچه محفوظ است</span>}
        />
        <div className="grid grid-cols-[390px_minmax(0,1fr)] gap-[14px] max-[900px]:grid-cols-1">
          <LeaveForm draft={draft} setDraft={setDraft} onSave={saveLeave} />
          <LeaveTable data={data} setData={setData} setDraft={setDraft} />
        </div>
      </section>
    </>
  );
}
