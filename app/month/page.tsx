"use client";

import { MonthPage } from "@/components/pages/month/month-page";
import { useSaatyarContext } from "@/components/saatyar-shell";

export default function MonthRoute() {
  const controller = useSaatyarContext();
  if (!controller.ready) return null;

  return (
    <MonthPage
      data={controller.data}
      selectedDate={controller.selectedDate}
      setSelectedDate={controller.setSelectedDate}
      monthRecords={controller.monthRecords}
      monthStats={controller.monthStats}
      dailyTarget={controller.dailyTarget}
    />
  );
}
