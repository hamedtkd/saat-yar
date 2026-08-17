"use client";

import { shiftDateKey } from "@/lib/format";
import type { AppData } from "@/lib/types";
import { CalendarAgendaSurface } from "./calendar-agenda-surface";
import { useCalendarRange } from "./use-calendar-range";

export function CalendarAgendaCard({ dateKey, data, setData, setToast, compact = false }: {
  dateKey: string;
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setToast: (message: string) => void;
  compact?: boolean;
}) {
  const integration = useCalendarRange({ startDateKey: dateKey, endDateKeyExclusive: shiftDateKey(dateKey, 1) });
  if (integration.state !== "connected") return null;
  return <CalendarAgendaSurface dateKey={dateKey} events={integration.events} loading={integration.loadingEvents} compact={compact} data={data} setData={setData} setToast={setToast} />;
}
