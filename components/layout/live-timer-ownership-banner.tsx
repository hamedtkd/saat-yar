"use client";

import { MonitorSmartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatTimerHeartbeat, LIVE_TIMER_HEARTBEAT_MS, type LiveTimerLock } from "@/lib/live-timer-lock";

export function LiveTimerOwnershipBanner({ blocked, owner, onTakeOver }: {
  blocked: boolean;
  owner: LiveTimerLock | null;
  onTakeOver: () => void;
}) {
  const { locale, s } = useSystemUi();
  const [confirming, setConfirming] = useState(false);
  const [heartbeatNow, setHeartbeatNow] = useState<number | null>(null);
  const ownerUpdatedAt = owner?.updatedAt;

  useEffect(() => {
    if (!blocked || !ownerUpdatedAt) return;
    const updateHeartbeatClock = () => setHeartbeatNow(Date.now());
    const timeoutId = window.setTimeout(updateHeartbeatClock, 0);
    const intervalId = window.setInterval(updateHeartbeatClock, LIVE_TIMER_HEARTBEAT_MS);
    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [blocked, ownerUpdatedAt]);

  if (!blocked || !owner) return null;
  const device = owner.deviceName || s("Unknown tab or device");
  const heartbeat = heartbeatNow === null
    ? s("Just now")
    : formatTimerHeartbeat(owner.updatedAt, heartbeatNow, locale);

  return <>
    <section className="shell-main-offset mx-auto mt-3 flex max-w-[var(--shell-content-max)] flex-wrap items-center justify-between gap-3 rounded-[15px] max-[359px]:gap-2 max-[359px]:px-3 border border-[color-mix(in_srgb,var(--warning)_35%,var(--border))] bg-[var(--warning-soft)] px-4 py-3 text-[var(--warning)]" role="status">
      <div className="flex items-start gap-3">
        <MonitorSmartphone className="mt-0.5 shrink-0" />
        <div className="grid gap-1">
          <strong className="text-xs">{s("Timer control is active in another tab.")}</strong>
          <span className="text-[10px] leading-5">{s("{device} · last activity {heartbeat}", { device, heartbeat })}</span>
        </div>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={() => setConfirming(true)}>{s("Transfer control to this tab")}</Button>
    </section>

    <AlertDialog open={confirming} onOpenChange={setConfirming}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{s("Transfer timer control to this tab?")}</AlertDialogTitle>
          <AlertDialogDescription>{s("The timer is active on “{device}” and its last heartbeat was {heartbeat}. After transfer, the previous tab can no longer change the timer.", { device, heartbeat })}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-xs text-[var(--text)]">
          <strong className="block">{device}</strong>
          <span className="mt-1 block text-[10px] text-[var(--text-muted)]">{s("Last activity: {heartbeat}", { heartbeat })}</span>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onTakeOver}>{s("Yes, transfer control")}</AlertDialogAction>
          <AlertDialogCancel>{s("Cancel")}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>;
}
