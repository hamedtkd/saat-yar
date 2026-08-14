"use client";

import { MoonStar, Sparkles } from "lucide-react";
import { TimePicker } from "@/components/pickers";
import { Checkbox } from "@/components/ui/checkbox";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { CustomRemindersEditor } from "./custom-reminders-editor";
import type { NotificationSettings } from "@/lib/types";

type Props = {
  settings: NotificationSettings;
  disabled: boolean;
  onUpdate: <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => void;
};

export function NotificationIntelligenceControls({ settings, disabled, onUpdate }: Props) {
  const { s } = useSystemUi();
  const quiet = settings.quietHours;

  return (
    <div data-notification-intelligence className="grid gap-3 lg:grid-cols-2">
      <section data-quiet-hours className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <span className="flex min-w-0 items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-strong)]"><MoonStar /></span><span className="grid gap-1"><strong className="text-[11px] text-[var(--text)]">{s("Quiet hours")}</strong><small className="text-[9px] leading-4 text-[var(--text-muted)]">{s("Suppress every work reminder during this window, including overnight ranges.")}</small></span></span>
          <Checkbox disabled={disabled} checked={quiet.enabled} onCheckedChange={(enabled) => onUpdate("quietHours", { ...quiet, enabled })} aria-label={s("Enable quiet hours")} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-[10px] font-bold text-[var(--text-muted)]"><span>{s("Quiet hours start")}</span><TimePicker disabled={disabled || !quiet.enabled} value={quiet.start} onChange={(start) => onUpdate("quietHours", { ...quiet, start })} /></label>
          <label className="grid gap-1.5 text-[10px] font-bold text-[var(--text-muted)]"><span>{s("Quiet hours end")}</span><TimePicker disabled={disabled || !quiet.enabled} value={quiet.end} onChange={(end) => onUpdate("quietHours", { ...quiet, end })} /></label>
        </div>
      </section>

      <section className="flex items-start gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--accent)_22%,var(--border))] bg-[var(--accent-soft)] p-3.5 sm:p-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--surface-1)] text-[var(--accent-strong)]"><Sparkles /></span>
        <div className="grid gap-1"><strong className="text-[11px] text-[var(--text)]">{s("Active-work intelligence")}</strong><small className="text-[9px] leading-5 text-[var(--text-muted)]">{s("Open-timer, target, break, and custom reminders pause during lunch or breaks. Quiet hours and snooze suppress all reminders until they expire.")}</small></div>
      </section>

      <CustomRemindersEditor reminders={settings.customReminders} disabled={disabled} onChange={(customReminders) => onUpdate("customReminders", customReminders)} />
    </div>
  );
}
