"use client";

import { CalendarDays } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import type { ExternalCalendarSource } from "@/lib/calendar-integration/types";

export function GoogleCalendarSourceList({ calendars, selectedCalendarIds, onSelectionChange }: {
  calendars: ExternalCalendarSource[];
  selectedCalendarIds: string[];
  onSelectionChange: (calendarId: string, selected: boolean) => void;
}) {
  const { t } = useLocaleUi();
  if (!calendars.length) {
    return <p className="rounded-[14px] border border-dashed border-[var(--dashboard-border)] bg-[var(--surface-2)] px-4 py-5 text-center text-[10px] text-[var(--text-muted)]">{t("calendar.google.noCalendars")}</p>;
  }
  return (
    <div className="grid gap-2" data-google-calendar-sources>
      {calendars.map((calendar) => {
        const checked = selectedCalendarIds.includes(calendar.id);
        return (
          <label key={calendar.id} className="!flex cursor-pointer items-center gap-3 rounded-[14px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 py-2.5">
            <Checkbox checked={checked} onCheckedChange={(value) => onSelectionChange(calendar.id, value)} aria-label={calendar.name} />
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[var(--surface-1)] text-[var(--accent-strong)]"><CalendarDays aria-hidden="true" className="size-3.5" /></span>
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-[11px] text-[var(--text)]">{calendar.name}</strong>
              <span className="mt-0.5 block text-[8px] text-[var(--text-muted)]">{calendar.primary ? `${t("calendar.google.primary")} · ${calendar.writable ? t("calendar.google.writable") : t("calendar.google.readOnly")}` : calendar.writable ? t("calendar.google.writable") : t("calendar.google.readOnly")}</span>
            </span>
            {calendar.color ? <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full border border-black/10" style={{ backgroundColor: calendar.color }} /> : null}
          </label>
        );
      })}
    </div>
  );
}
