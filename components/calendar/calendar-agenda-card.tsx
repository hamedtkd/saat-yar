"use client";

import { shiftDateKey } from "@/lib/format";
import { CalendarAgendaSurface } from "./calendar-agenda-surface";
import { useCalendarRange } from "./use-calendar-range";

export function CalendarAgendaCard({ dateKey, compact = false }: { dateKey: string; compact?: boolean }) {
  const integration = useCalendarRange({ startDateKey: dateKey, endDateKeyExclusive: shiftDateKey(dateKey, 1) });
  if (integration.state !== "connected") return null;
  return <CalendarAgendaSurface dateKey={dateKey} events={integration.events} loading={integration.loadingEvents} compact={compact} />;
}
