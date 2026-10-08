"use client";

import { ArrowDownToLine, CalendarPlus2, CheckCircle2, Clock3, History, MinusCircle, Umbrella } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeading } from "@/components/common/page-heading";
import { SectionHeading } from "@/components/common/section-heading";
import { useBusinessUi } from "@/components/i18n/use-business-ui";
import { cn } from "@/lib/cn";
import type { LeaveEntitlementSummary } from "@/lib/leave-entitlement";
import type { AppData, LeaveEntry } from "@/lib/types";
import { LeaveForm } from "./leave-form";
import { LeaveAccrualPanel } from "./leave-accrual-panel";
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
  const { b, duration } = useBusinessUi();
  return (
    <>
      <PageHeading title={b("leave.title")} description={b("leave.description")} />

      <section className="mb-5">
        <SectionHeading icon={<Umbrella />} eyebrow={b("leave.overview.eyebrow")} title={b("leave.overview.title")} description={b("leave.overview.description")} />
        <div className={cn("grid gap-3", "grid-cols-4 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1")}>
          <MetricCard icon={<Umbrella />} label={b("leave.metrics.monthly")} value={duration(summary.monthlyEntitlement)} suffix={b("common.hour")} tone="blue" />
          <MetricCard icon={<Clock3 />} label={b("leave.metrics.accrued")} value={duration(summary.accruedThisYear)} suffix={b("common.hour")} tone="blue" />
          <MetricCard icon={<ArrowDownToLine />} label={b("leave.metrics.carryover")} value={duration(summary.carryover)} suffix={b("common.hour")} tone="blue" />
          <MetricCard icon={<Clock3 />} label={b("leave.metrics.used")} value={duration(used)} suffix={b("common.hour")} tone="amber" />
          <MetricCard icon={<MinusCircle />} label={b("leave.metrics.adjustments")} value={`${summary.adjustments > 0 ? "+" : summary.adjustments < 0 ? "−" : ""}${duration(Math.abs(summary.adjustments))}`} suffix={b("common.hour")} tone="amber" />
          <MetricCard icon={<ArrowDownToLine />} label={b("leave.metrics.cashOut")} value={duration(summary.cashOut)} suffix={b("common.hour")} tone="amber" />
          <MetricCard icon={<CheckCircle2 />} label={b("leave.metrics.remaining")} value={duration(available)} suffix={b("common.hour")} />
        </div>
        <p className="mt-3 text-xs text-[var(--text-muted)]">{b("leave.metrics.annual")}: <strong className="text-[var(--text)]">{duration(summary.annualEntitlement)}</strong></p>
        <p className="mt-3 text-[10px] leading-6 text-[var(--text-muted)]">{b("leave.overview.note")}</p>
      </section>

      <LeaveAccrualPanel data={data} setData={setData} summary={summary} />

      <section>
        <SectionHeading
          icon={<CalendarPlus2 />}
          eyebrow={b("leave.section.eyebrow")}
          title={b("leave.section.title")}
          description={b("leave.section.description")}
          trailing={<span className="inline-flex items-center gap-1.5 rounded-[var(--control-radius-sm)] bg-[var(--surface-2)] px-3 py-1.5 text-[10px] font-bold text-[var(--text-muted)]"><History className="size-3.5 text-[var(--accent-strong)]" /> {b("leave.section.historySafe")}</span>}
        />
        <div className="grid grid-cols-[390px_minmax(0,1fr)] gap-[14px] max-[900px]:grid-cols-1">
          <LeaveForm draft={draft} setDraft={setDraft} onSave={saveLeave} />
          <LeaveTable data={data} setData={setData} setDraft={setDraft} />
        </div>
      </section>
    </>
  );
}
