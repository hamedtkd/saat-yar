"use client";

import { LoaderCircle } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { localDateKey, shiftDateKey } from "@/lib/format";
import { useCalendarRange } from "./use-calendar-range";

export function GoogleCalendarPreview() {
  const { t, date, time } = useLocaleUi();
  const startDateKey = localDateKey();
  const integration = useCalendarRange({ startDateKey, endDateKeyExclusive: shiftDateKey(startDateKey, 8) });
  const preview = integration.events.slice(0, 5);

  return (
    <div data-google-calendar-preview className="rounded-[14px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-3">
      <strong className="block text-[10px] text-[var(--text)]">{t("calendar.google.previewTitle")}</strong>
      <p className="mt-1 text-[9px] leading-5 text-[var(--text-muted)]">{t("calendar.google.previewDescription")}</p>
      {integration.loadingEvents ? (
        <div className="mt-3 flex min-h-16 items-center justify-center gap-2 text-[9px] text-[var(--text-muted)]"><LoaderCircle aria-hidden="true" className="size-3.5 animate-spin motion-reduce:animate-none" /> {t("calendar.google.loading")}</div>
      ) : preview.length ? (
        <div className="mt-3 grid gap-2">
          {preview.map((event) => (
            <div key={`${event.calendarId}:${event.id}`} className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 rounded-xl bg-[var(--surface-1)] px-3 py-2">
              <span className="mt-1 size-2 rounded-full bg-[var(--accent)]" aria-hidden="true" />
              <div className="min-w-0">
                <strong className="block truncate text-[10px] text-[var(--text)]">{event.title || t("calendar.google.busy")}</strong>
                <span className="mt-0.5 block truncate text-[8px] text-[var(--text-muted)]">
                  {date(event.startDateKey, { weekday: "short", month: "short", day: "numeric" })} · {event.allDay ? t("calendar.google.allDay") : time(event.start)} · {event.calendarName}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : <p className="mt-3 text-[9px] text-[var(--text-muted)]">{t("calendar.google.emptyPreview")}</p>}
    </div>
  );
}
