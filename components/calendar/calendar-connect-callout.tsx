"use client";

import { CalendarPlus2, RefreshCw } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import { useCalendarIntegration } from "./calendar-integration-provider";

export function CalendarConnectCallout() {
  const { t } = useLocaleUi();
  const integration = useCalendarIntegration();
  if (!integration.configured || integration.state === "connected") return null;
  const busy = integration.state === "connecting";
  return (
    <div data-calendar-connect-callout className="mb-4 grid gap-3 rounded-[18px] border border-[color-mix(in_srgb,var(--accent)_24%,var(--dashboard-border))] bg-[color-mix(in_srgb,var(--accent)_7%,var(--surface-1))] p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
      <span className="grid size-10 place-items-center rounded-[13px] bg-[var(--accent-soft)] text-[var(--accent-strong)]"><CalendarPlus2 aria-hidden="true" className="size-5" /></span>
      <div className="min-w-0"><strong className="block text-[12px] font-black text-[var(--text)]">{t("calendar.google.discoverTitle")}</strong><p className="mt-1 text-[9px] leading-5 text-[var(--text-muted)]">{t("calendar.google.discoverDescription")}</p></div>
      <Button type="button" size="sm" disabled={busy} onClick={() => { void integration.connect(); }}><RefreshCw aria-hidden="true" className={busy ? "animate-spin motion-reduce:animate-none" : ""} />{busy ? t("calendar.google.status.connecting") : t("calendar.google.discoverAction")}</Button>
    </div>
  );
}
