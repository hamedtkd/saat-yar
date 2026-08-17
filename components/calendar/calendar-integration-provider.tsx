"use client";

import { useContext } from "react";
import { CalendarIntegrationContext } from "./calendar-integration-context";
import { useCalendarIntegrationController } from "./use-calendar-integration-controller";

export function CalendarIntegrationProvider({ children, onToast }: { children: React.ReactNode; onToast?: (message: string) => void }) {
  const value = useCalendarIntegrationController(onToast);
  return <CalendarIntegrationContext.Provider value={value}>{children}</CalendarIntegrationContext.Provider>;
}

export function useCalendarIntegration() {
  const context = useContext(CalendarIntegrationContext);
  if (!context) throw new Error("useCalendarIntegration must be used within CalendarIntegrationProvider");
  return context;
}
