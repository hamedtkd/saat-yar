"use client";

import { MonitorSmartphone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatTimerHeartbeat, type LiveTimerLock } from "@/lib/live-timer-lock";

export function LiveTimerOwnershipBanner({ blocked, owner, onTakeOver }: {
  blocked: boolean;
  owner: LiveTimerLock | null;
  onTakeOver: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  if (!blocked || !owner) return null;
  const device = owner.deviceName || "تب یا دستگاه ناشناس";
  const heartbeat = formatTimerHeartbeat(owner.updatedAt);

  return <>
    <section className="shell-main-offset mx-auto mt-3 flex max-w-[var(--shell-content-max)] flex-wrap items-center justify-between gap-3 rounded-[15px] border border-[color-mix(in_srgb,var(--warning)_35%,var(--border))] bg-[var(--warning-soft)] px-4 py-3 text-[var(--warning)]" role="status">
      <div className="flex items-start gap-3">
        <MonitorSmartphone className="mt-0.5 shrink-0" />
        <div className="grid gap-1">
          <strong className="text-xs">کنترل تایمر در تب دیگری فعال است</strong>
          <span className="text-[10px] leading-5">{device} · آخرین فعالیت {heartbeat}</span>
        </div>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={() => setConfirming(true)}>انتقال کنترل به این تب</Button>
    </section>

    <AlertDialog open={confirming} onOpenChange={setConfirming}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>کنترل تایمر به این تب منتقل شود؟</AlertDialogTitle>
          <AlertDialogDescription>تایمر اکنون در «{device}» فعال است و آخرین Heartbeat آن {heartbeat} ثبت شده. بعد از انتقال، تب قبلی دیگر اجازه تغییر تایمر را ندارد.</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-xs text-[var(--text)]">
          <strong className="block">{device}</strong>
          <span className="mt-1 block text-[10px] text-[var(--text-muted)]">آخرین فعالیت: {heartbeat}</span>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onTakeOver}>بله، انتقال کنترل</AlertDialogAction>
          <AlertDialogCancel>انصراف</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>;
}
