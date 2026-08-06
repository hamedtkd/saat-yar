"use client";

import { MonitorSmartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LiveTimerOwnershipBanner({ blocked, onTakeOver }: { blocked: boolean; onTakeOver: () => void }) {
  if (!blocked) return null;
  return (
    <section className="mx-auto mt-3 flex max-w-[1470px] flex-wrap items-center justify-between gap-3 rounded-[15px] border border-[color-mix(in_srgb,var(--warning)_35%,var(--border))] bg-[var(--warning-soft)] px-4 py-3 text-[var(--warning)] xl:mr-[284px]" role="status">
      <div className="flex items-start gap-3">
        <MonitorSmartphone className="mt-0.5 shrink-0" />
        <div className="grid gap-1"><strong className="text-xs">کنترل تایمر در تب دیگری فعال است</strong><span className="text-[10px] leading-5">برای جلوگیری از ثبت هم‌زمان، دکمه‌های شروع و پایان در این تب اجرا نمی‌شوند.</span></div>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onTakeOver}>انتقال کنترل به این تب</Button>
    </section>
  );
}
