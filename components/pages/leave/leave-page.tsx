import { CalendarPlus2, CheckCircle2, Clock3, History, Umbrella } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeading } from "@/components/common/page-heading";
import { SectionHeading } from "@/components/common/section-heading";
import { cn } from "@/lib/cn";
import { duration } from "@/lib/format";
import type { LeaveEntitlementSummary } from "@/lib/leave-entitlement";
import type { AppData, LeaveEntry } from "@/lib/types";
import { LeaveForm } from "./leave-form";
import { LeaveTable } from "./leave-table";

export function LeavePage({ data, setData, draft, setDraft, saveLeave, used, available, summary }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  draft: LeaveEntry;
  setDraft: React.Dispatch<React.SetStateAction<LeaveEntry>>;
  saveLeave: () => void;
  used: number;
  available: number;
  summary: LeaveEntitlementSummary;
}) {
  return (
    <>
      <PageHeading title="مرخصی‌های من" description="سهمیه، درخواست‌های شخصی و تاریخچه مرخصی را در یک جریان ساده مدیریت کن." />

      <section className="mb-5">
        <SectionHeading
          icon={<Umbrella />}
          eyebrow="وضعیت سهمیه"
          title="نمای کلی مرخصی"
          description="مبنای پیش‌فرض قانون کار: ۲۶ روز × ۷:۲۰ = ۱۹۰:۴۰ در سال؛ میانگین ماهانه حدود ۱۵:۵۳ است."
        />
        <div className={cn("grid gap-3", "grid-cols-4 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1")}>
          <MetricCard icon={<Umbrella />} label="سهمیه ماهانه" value={duration(summary.monthlyEntitlement)} suffix="ساعت" tone="blue" />
          <MetricCard icon={<Umbrella />} label="سهمیه سالانه" value={duration(summary.annualEntitlement)} suffix="ساعت" tone="blue" />
          <MetricCard icon={<Clock3 />} label="مصرف‌شده امسال" value={duration(used)} suffix="ساعت" tone="amber" />
          <MetricCard icon={<CheckCircle2 />} label="مانده امسال" value={duration(available)} suffix="ساعت" />
        </div>
        <p className="mt-3 text-[10px] leading-6 text-[var(--text-muted)]">
          تعطیلات رسمی، جمعه و روزهای غیرفعال برنامه کاری از مرخصی روزانه کسر نمی‌شوند. مانده انتقالی یا اصلاح دستی، در صورت وجود، به سهمیه سالانه اضافه می‌شود.
        </p>
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
