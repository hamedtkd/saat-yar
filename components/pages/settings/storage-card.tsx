import { HardDrive, Info, ShieldCheck } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { Button } from "@/components/ui/button";
import type { StorageInfo } from "@/lib/types";
import { cn } from "@/lib/cn";

export function StorageCard({ storage, requestPersistence }: { storage: StorageInfo; requestPersistence: () => Promise<void> }) {
  const usagePercent = storage.quota ? Math.min(100, storage.usage / storage.quota * 100) : 0;
  return (
    <section id="settings-storage" className={cn("scroll-mt-24 dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] shadow-[0_5px_16px_rgba(0,0,0,.03)] p-4", "p-5")}>
      <PanelHead icon={<HardDrive />} title="فضای ذخیره‌سازی" />
      <dl className={cn("m-0 [&>div]:flex [&>div]:justify-between [&>div]:gap-[10px] [&>div]:py-2 [&_dt]:text-[10px] [&_dt]:text-[var(--text-muted)] [&_dd]:m-0 [&_dd]:text-[11px]")}><div><dt>محل ذخیره‌سازی</dt><dd>ذخیره مرورگر (IndexedDB)</dd></div><div><dt>فضای استفاده‌شده</dt><dd>{(storage.usage / 1024 / 1024).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} مگابایت</dd></div></dl>
      <div className={cn("mb-[15px] mt-2 [&>i]:my-2 [&>i]:block [&>i]:h-[7px] [&>i]:overflow-hidden [&>i]:rounded-[10px] [&>i]:bg-[var(--border)] [&>i>b]:block [&>i>b]:h-full [&>i>b]:rounded-[inherit] [&>i>b]:bg-[var(--accent)] [&_span]:text-[9px] [&_span]:text-[var(--text-muted)]")}><i><b style={{ width: `${Math.max(2, usagePercent)}%` }} /></i><span>حدود {(storage.quota / 1024 / 1024 / 1024).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} گیگابایت سهمیه تقریبی مرورگر</span></div>
      <Button className={cn("w-full")} onClick={() => void requestPersistence()}><ShieldCheck /> {storage.persisted ? "ذخیره پایدار فعال است" : "درخواست ذخیره پایدار"}</Button>
      <p className={cn("mt-3 flex items-start gap-[7px] text-[10px] leading-[1.8] text-[var(--text-muted)] [&_svg]:mt-0.5 [&_svg]:w-[14px] [&_svg]:flex-none")}><Info />سیستم‌عامل یا مرورگر ممکن است در شرایط کمبود فضا داده‌های محلی را پاک کند؛ پشتیبان منظم توصیه می‌شود.</p>
    </section>
  );
}
