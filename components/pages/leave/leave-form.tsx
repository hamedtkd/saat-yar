"use client";

import type { Dispatch, SetStateAction } from "react";
import { Info, Plus, Save } from "lucide-react";
import { NumberField } from "@/components/common/number-field";
import { PanelHead } from "@/components/common/panel-head";
import { SurfaceCard } from "@/components/common/surface-card";
import { useBusinessUi } from "@/components/i18n/use-business-ui";
import { JalaliDatePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import type { LeaveEntry } from "@/lib/types";

type LeaveFormProps = {
  draft: LeaveEntry;
  setDraft: Dispatch<SetStateAction<LeaveEntry>>;
  onSave: () => void;
};

export function LeaveForm({ draft, setDraft, onSave }: LeaveFormProps) {
  const { b } = useBusinessUi();
  const isEditing = Boolean(draft.id);
  const isHourly = draft.type === "hourly";

  const updateDraft = <K extends keyof LeaveEntry>(key: K, value: LeaveEntry[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const canSave = Boolean(draft.type)
    && Boolean(draft.startDate)
    && Boolean(draft.endDate)
    && (!isHourly || draft.minutes > 0);

  return (
    <SurfaceCard as="article" className="self-start min-w-0 overflow-hidden p-4 sm:p-5">
      <PanelHead icon={<Plus aria-hidden="true" />} title={isEditing ? b("leave.form.edit") : b("leave.form.new")} />

      <div className="mt-4 grid min-w-0 grid-cols-1 gap-4">
        <div className="grid min-w-0 grid-cols-1 gap-4 min-[520px]:grid-cols-2">
          <label className={cn("grid min-w-0 gap-2", { "col-span-2": !isHourly })}>
            <span className="text-xs font-bold text-[var(--text)]">{b("leave.form.type")}</span>
            <Select value={draft.type} onValueChange={(type) => updateDraft("type", type as LeaveEntry["type"])}>
              <SelectTrigger aria-label={b("leave.form.typeAria")} className={cn("h-12 w-full min-w-0 rounded-xl border-[var(--border)] bg-[var(--surface-1)] px-3 text-sm font-bold shadow-none", { "col-span-2": !isHourly })}>
                <SelectValue placeholder={b("leave.form.typePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">{b("leave.type.full")}</SelectItem>
                <SelectItem value="half">{b("leave.type.half")}</SelectItem>
                <SelectItem value="hourly">{b("leave.type.hourly")}</SelectItem>
              </SelectContent>
            </Select>
          </label>

          {isHourly && (
            <label className="grid min-w-0 gap-2">
              <span className="text-xs font-bold text-[var(--text)]">{b("leave.form.duration")}</span>
              <div className="relative min-w-0">
                <NumberField value={draft.minutes} onValueChange={(minutes) => updateDraft("minutes", minutes)} />
                <span className="pointer-events-none absolute top-1/2 end-3 -translate-y-1/2 text-[11px] font-semibold text-[var(--text-muted)]">{b("leave.form.minutes")}</span>
              </div>
            </label>
          )}
        </div>

        <label className="grid min-w-0 gap-2">
          <span className="text-xs font-bold text-[var(--text)]">{b("leave.form.from")}</span>
          <div className="min-w-0 [&>*]:w-full [&>div]:w-full [&_button]:w-full [&_button]:min-w-0">
            <JalaliDatePicker value={draft.startDate} onChange={(startDate) => updateDraft("startDate", startDate)} />
          </div>
        </label>

        <label className="grid min-w-0 gap-2">
          <span className="text-xs font-bold text-[var(--text)]">{b("leave.form.to")}</span>
          <div className="min-w-0 [&>*]:w-full [&>div]:w-full [&_button]:w-full [&_button]:min-w-0">
            <JalaliDatePicker value={draft.endDate} onChange={(endDate) => updateDraft("endDate", endDate)} />
          </div>
        </label>

        <label className="grid min-w-0 gap-2">
          <span className="text-xs font-bold text-[var(--text)]">{b("leave.form.optionalNote")}</span>
          <Input value={draft.note} onChange={(event) => updateDraft("note", event.target.value)} placeholder={b("leave.form.notePlaceholder")} className="h-12 w-full min-w-0 rounded-xl border-[var(--border)] bg-[var(--surface-1)] px-3 text-sm shadow-none placeholder:text-[var(--text-muted)]/70 focus-visible:border-[var(--accent)] focus-visible:ring-[var(--accent-soft)]" />
        </label>
      </div>

      <Button type="button" className="mt-5 h-13 w-full rounded-xl bg-[var(--accent-fill)] text-sm font-extrabold text-[var(--accent-foreground)] shadow-none hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50" disabled={!canSave} onClick={onSave}>
        <Save aria-hidden="true" className="size-4.5" />
        {isEditing ? b("leave.form.saveEdit") : b("leave.form.save")}
      </Button>

      <p className="mt-3 flex items-start gap-2 text-[10px] leading-7 text-[var(--text-muted)]">
        <Info aria-hidden="true" className="mt-1 size-4 shrink-0" />
        <span>{b("leave.form.personalHint")}</span>
      </p>
    </SurfaceCard>
  );
}
