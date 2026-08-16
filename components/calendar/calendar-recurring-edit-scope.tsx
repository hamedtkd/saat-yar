"use client";

import { Repeat2 } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ExternalCalendarEditScope } from "@/lib/calendar-integration/types";

export function CalendarRecurringEditScope({ value, onChange }: {
  value: ExternalCalendarEditScope;
  onChange: (value: ExternalCalendarEditScope) => void;
}) {
  const { t } = useLocaleUi();
  return (
    <div data-calendar-recurring-edit-scope className="grid gap-2 rounded-xl border border-[var(--dashboard-border)] bg-[var(--accent-soft)] p-3">
      <div className="flex items-start gap-2"><Repeat2 className="mt-0.5 size-4 shrink-0 text-[var(--accent-strong)]" /><div><strong className="block text-[10px] text-[var(--text)]">{t("calendar.google.editScope")}</strong><p className="mt-0.5 text-[9px] leading-5 text-[var(--text-muted)]">{value === "series" ? t("calendar.google.editSeriesHint") : t("calendar.google.editOccurrenceHint")}</p></div></div>
      <Select value={value} onValueChange={(next) => onChange(next as ExternalCalendarEditScope)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="occurrence">{t("calendar.google.editOccurrence")}</SelectItem>
          <SelectItem value="series">{t("calendar.google.editSeries")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
