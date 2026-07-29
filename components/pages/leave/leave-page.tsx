import { CheckCircle2, Clock3, Umbrella } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeading } from "@/components/common/page-heading";
import { duration } from "@/lib/format";
import { tw } from "@/lib/tw";
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
  return <>
    <PageHeading title="مرخصی‌های من" description="سهمیه، درخواست‌های شخصی و تاریخچه مرخصی را مدیریت کن." />
    <section className={tw("metric-grid", "three")}><MetricCard icon={<Umbrella />} label="سهمیه کل" value={duration(data.settings.leaveBalanceMinutes + data.settings.monthlyLeaveMinutes)} suffix="ساعت" tone="blue" /><MetricCard icon={<Clock3 />} label="مصرف‌شده" value={duration(used)} suffix="ساعت" tone="amber" /><MetricCard icon={<CheckCircle2 />} label="مانده مرخصی" value={duration(available)} suffix="ساعت" /></section>
    <section className={tw("leave-layout")}><LeaveForm draft={draft} setDraft={setDraft} onSave={saveLeave} /><LeaveTable data={data} setData={setData} setDraft={setDraft} /></section>
  </>;
}
