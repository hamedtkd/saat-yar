"use client";

import { CalendarSync, ChevronDown, Link2Off, RefreshCw, ShieldCheck } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge, type StatusBadgeTone } from "@/components/common/status-badge";
import { GoogleCalendarSourceList } from "@/components/calendar/google-calendar-source-list";
import { useCalendarIntegration } from "@/components/calendar/calendar-integration-provider";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";

const stateTone: Record<string, StatusBadgeTone> = {
  connected: "success", connecting: "info", expired: "warning", error: "danger", unconfigured: "neutral", disconnected: "neutral",
};

export function GoogleCalendarCard() {
  const { t, number, time } = useLocaleUi();
  const integration = useCalendarIntegration();
  const statusKey = `calendar.google.status.${integration.state}` as const;
  const errorKey = integration.errorCode ? `calendar.google.error.${integration.errorCode}` as const : null;
  const selectedCount = integration.selectedCalendarIds.length;
  const writableCount = integration.writableCalendars.length;

  return (
    <section id="settings-calendar-integration" data-google-calendar-settings className="col-span-full scroll-mt-24 dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-5">
      <PanelHead icon={<CalendarSync />} title={t("calendar.google.title")}><StatusBadge tone={stateTone[integration.state] ?? "neutral"}>{t(statusKey)}</StatusBadge></PanelHead>
      <p className="mb-4 max-w-3xl text-[10px] leading-6 text-[var(--text-muted)]">{t("calendar.google.description")}</p>

      {!integration.configured ? (
        <div data-google-calendar-unconfigured className="rounded-[14px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-4"><strong className="block text-[11px] text-[var(--text)]">{t("calendar.google.configTitle")}</strong><p className="mt-1 text-[9px] leading-5 text-[var(--text-muted)]">{t("calendar.google.configDescription")}</p><code className="mt-3 block overflow-x-auto rounded-xl bg-[var(--surface-1)] px-3 py-2 text-[9px] text-[var(--accent-strong)]">NEXT_PUBLIC_GOOGLE_CALENDAR_CLIENT_ID</code></div>
      ) : integration.state === "connected" ? (
        <div className="grid gap-3">
          <div className="grid gap-4 rounded-[14px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="grid gap-1"><strong className="text-[11px] text-[var(--text)]">{t("calendar.google.connectedSummary", { selected: number(selectedCount), writable: number(writableCount) })}</strong><span className="text-[9px] leading-5 text-[var(--text-muted)]">{t("calendar.google.connectedDescription")}</span>{integration.syncMode && integration.lastSyncedAt ? <span data-calendar-sync-status className="flex flex-wrap items-center gap-1.5 text-[8px] font-bold text-[var(--accent-strong)]"><RefreshCw className="size-3" />{t(`calendar.google.sync.${integration.syncMode}`)}<span className="text-[var(--text-muted)]">· {t("calendar.google.syncLast", { time: time(integration.lastSyncedAt) })}</span></span> : null}{errorKey ? <span className="text-[8px] leading-5 text-[var(--warning)]">{t(errorKey)}</span> : null}</div>
            <div className="flex flex-wrap items-center gap-2 md:justify-end"><Button size="sm" variant="outline" onClick={integration.disconnect}><Link2Off /> {t("calendar.google.disconnect")}</Button><Button size="sm" variant="ghost" onClick={() => { void integration.revoke(); }}>{t("calendar.google.revoke")}</Button></div>
          </div>
          <details className="group overflow-hidden rounded-[14px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-1 text-[10px] font-bold text-[var(--text)]"><span>{t("calendar.google.manageSources")}</span><ChevronDown className="size-4 text-[var(--text-muted)] transition-transform group-open:rotate-180" /></summary>
            <div className="mt-3 grid gap-3 border-t border-[var(--border)] pt-3"><p className="text-[9px] leading-5 text-[var(--text-muted)]">{t("calendar.google.sourcesDescription")}</p><GoogleCalendarSourceList calendars={integration.calendars} selectedCalendarIds={integration.selectedCalendarIds} onSelectionChange={integration.setCalendarSelected} /></div>
          </details>
        </div>
      ) : (
        <div className="grid gap-3 rounded-[14px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><strong className="block text-[11px] text-[var(--text)]">{integration.state === "expired" ? t("calendar.google.expiredTitle") : t("calendar.google.connectTitle")}</strong><p className="mt-1 text-[9px] leading-5 text-[var(--text-muted)]">{errorKey ? t(errorKey) : t("calendar.google.connectDescription")}</p></div><Button disabled={integration.state === "connecting"} onClick={() => { void integration.connect(); }}><RefreshCw aria-hidden="true" className={integration.state === "connecting" ? "animate-spin motion-reduce:animate-none" : ""} />{integration.state === "expired" || integration.state === "error" ? t("calendar.google.reconnect") : t("calendar.google.connect")}</Button></div>
      )}

      <div className="mt-4 flex flex-wrap items-start gap-3 rounded-[14px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-3 text-[9px] leading-5 text-[var(--text-muted)]"><ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--accent-strong)]" /><p className="min-w-0 flex-1"><strong className="me-1 text-[10px] text-[var(--text)]">{t("calendar.google.privacyTokenTitle")}</strong>{t("calendar.google.privacyToken")} {t("calendar.google.writePrivacy")}</p></div>
    </section>
  );
}
