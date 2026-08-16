"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import { chooseWritableCalendar } from "@/lib/calendar-integration/draft";
import { useCalendarIntegration } from "./calendar-integration-provider";
import { CalendarEventDialog } from "./calendar-event-dialog";

export function CalendarEventQuickAction({ dateKey, compact = false }: { dateKey: string; compact?: boolean }) {
  const { t } = useLocaleUi();
  const integration = useCalendarIntegration();
  const [open, setOpen] = useState(false);
  const calendar = useMemo(() => chooseWritableCalendar(integration.calendars, integration.selectedCalendarIds), [integration.calendars, integration.selectedCalendarIds]);
  if (integration.state !== "connected" || !calendar) return null;
  return <>
    <Button type="button" size="sm" variant={compact ? "outline" : "default"} className={compact ? "h-8 rounded-xl px-2.5 text-[9px]" : undefined} onClick={() => setOpen(true)}><Plus className="size-3.5" />{t("calendar.google.createForSelectedDay")}</Button>
    <CalendarEventDialog open={open} onOpenChange={setOpen} dateKey={dateKey} defaultCalendarId={calendar.id} calendars={integration.calendars} busy={integration.mutating} onCreate={integration.createEvent} onUpdate={integration.updateEvent} onDelete={integration.deleteEvent} />
  </>;
}
