import { CheckCircle2, Clock3, Umbrella } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeading } from "@/components/common/page-heading";
import { duration } from "@/lib/format";
import type { AppData, LeaveEntry } from "@/lib/types";
import { LeaveForm } from "./leave-form";
import { LeaveTable } from "./leave-table";
import { cn } from "@/lib/cn";

export function LeavePage({ data, setData, draft, setDraft, saveLeave, used, available }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  draft: LeaveEntry;
  setDraft: React.Dispatch<React.SetStateAction<LeaveEntry>>;
  saveLeave: () => void;
  used: number;
  available: number;
}) {
  return <>
    <PageHeading title="مرخصی‌های من" description="سهمیه، درخواست‌های شخصی و تاریخچه مرخصی را مدیریت کن." />
    <section className={cn("mb-[18px] grid gap-3", "grid-cols-3 max-[620px]:grid-cols-1")}><MetricCard icon={<Umbrella />} label="سهمیه کل" value={duration(data.settings.leaveBalanceMinutes + data.settings.monthlyLeaveMinutes)} suffix="ساعت" tone="blue" /><MetricCard icon={<Clock3 />} label="مصرف‌شده" value={duration(used)} suffix="ساعت" tone="amber" /><MetricCard icon={<CheckCircle2 />} label="مانده مرخصی" value={duration(available)} suffix="ساعت" /></section>
    <section className={cn("grid grid-cols-[390px_minmax(0,1fr)] gap-[14px] max-[900px]:grid-cols-1")}><LeaveForm draft={draft} setDraft={setDraft} onSave={saveLeave} /><LeaveTable data={data} setData={setData} setDraft={setDraft} /></section>
  </>;
}
