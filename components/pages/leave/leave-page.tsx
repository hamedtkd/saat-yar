"use client";

import { useRef, useState } from "react";
import { ArrowDownToLine, CalendarPlus2, CheckCircle2, Clock3, History, Plus } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeading } from "@/components/common/page-heading";
import { useBusinessUi } from "@/components/i18n/use-business-ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { LeaveEntitlementSummary } from "@/lib/leave-entitlement";
import type { AppData, LeaveEntry } from "@/lib/types";
import { LeaveForm } from "./leave-form";
import { LeaveAccrualPanel } from "./leave-accrual-panel";
import { LeaveTable } from "./leave-table";

type LeaveTab = "requests" | "balance";

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
  const [tab, setTab] = useState<LeaveTab>("requests");
  const [formOpen, setFormOpen] = useState(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectTab = (next: LeaveTab) => {
    setTab(next);
    requestAnimationFrame(() => tabRefs.current[next === "requests" ? 0 : 1]?.focus());
  };

  function handleTabKey(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "Home") { event.preventDefault(); selectTab("requests"); }
    else if (event.key === "End") { event.preventDefault(); selectTab("balance"); }
    else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      selectTab(index === 0 ? "balance" : "requests");
    }
  }

  const openCreate = () => {
    setDraft({ id: "", type: "full", startDate: "", endDate: "", minutes: 0, note: "", createdAt: "" });
    setFormOpen(true);
  };
  const handleSave = () => { saveLeave(); setFormOpen(false); };
  const handleEdit = (entry: LeaveEntry) => { setDraft({ ...entry }); setFormOpen(true); };

  return (
    <>
      <PageHeading title={b("leave.title")} description={b("leave.description")} autosave={false}>
        <Button onClick={openCreate}><Plus aria-hidden="true" />{b("leave.form.new")}</Button>
      </PageHeading>

      <section aria-label={b("leave.overview.title")} className="mb-5">
        <div data-leave-primary-metrics className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[520px]:gap-2">
          <MetricCard icon={<CheckCircle2 />} label={b("leave.metrics.remaining")} value={duration(available)} suffix={b("common.hour")} />
          <MetricCard icon={<Clock3 />} label={b("leave.metrics.accrued")} value={duration(summary.accruedThisYear)} suffix={b("common.hour")} tone="blue" />
          <MetricCard icon={<CalendarPlus2 />} label={b("leave.metrics.used")} value={duration(used)} suffix={b("common.hour")} tone="amber" />
          <MetricCard icon={<ArrowDownToLine />} label={b("leave.metrics.carryover")} value={duration(summary.carryover)} suffix={b("common.hour")} tone="blue" />
        </div>
      </section>

      <div role="tablist" aria-label={b("leave.tabs.label")} className="mb-4 flex gap-2 rounded-[var(--card-radius)] border border-[var(--border)] bg-[var(--surface-2)] p-1 max-[520px]:grid max-[520px]:grid-cols-2">
        {[b("leave.tabs.requests"), b("leave.tabs.balance")].map((label, index) => {
          const selected = (index === 0 && tab === "requests") || (index === 1 && tab === "balance");
          return <button key={label} ref={(element) => { tabRefs.current[index] = element; }} type="button" role="tab" id={`leave-tab-${index}`} aria-selected={selected} aria-controls={`leave-panel-${index}`} tabIndex={selected ? 0 : -1} onClick={() => setTab(index === 0 ? "requests" : "balance")} onKeyDown={(event) => handleTabKey(event, index)} className={`min-h-11 rounded-[var(--control-radius)] px-4 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${selected ? "bg-[var(--surface-1)] text-[var(--text)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}>
            {label}
          </button>;
        })}
      </div>

      {tab === "requests" ? (
        <section id="leave-panel-0" role="tabpanel" aria-labelledby="leave-tab-0" tabIndex={0}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2"><History className="size-4 text-[var(--accent-strong)]" /><h2 className="text-base font-black">{b("leave.section.title")}</h2></div>
            <Button variant="outline" size="sm" onClick={openCreate}><Plus aria-hidden="true" />{b("leave.form.new")}</Button>
          </div>
          <LeaveTable data={data} setData={setData} setDraft={setDraft} onEdit={handleEdit} />
        </section>
      ) : (
        <section id="leave-panel-1" role="tabpanel" aria-labelledby="leave-tab-1" tabIndex={0}>
          <LeaveAccrualPanel data={data} setData={setData} summary={summary} />
        </section>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="gap-4">
          <DialogHeader>
            <DialogTitle>{draft.id ? b("leave.form.edit") : b("leave.form.new")}</DialogTitle>
            <DialogDescription>{b("leave.form.dialogHint")}</DialogDescription>
          </DialogHeader>
          <LeaveForm draft={draft} setDraft={setDraft} onSave={handleSave} available={available} data={data} onCancel={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
