import { HardDrive, Info, ShieldCheck } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { Button } from "@/components/ui/button";
import { tw } from "@/lib/tw";
import type { StorageInfo } from "@/lib/types";

export function StorageCard({ storage, requestPersistence }: { storage: StorageInfo; requestPersistence: () => Promise<void> }) {
  const usagePercent = storage.quota ? Math.min(100, storage.usage / storage.quota * 100) : 0;
  return (
    <section className={tw("panel", "settings-card")}>
      <PanelHead icon={<HardDrive />} title="فضای ذخیره‌سازی" />
      <dl className={tw("storage-list")}><div><dt>محل ذخیره‌سازی</dt><dd>ذخیره مرورگر (IndexedDB)</dd></div><div><dt>فضای استفاده‌شده</dt><dd>{(storage.usage / 1024 / 1024).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} مگابایت</dd></div></dl>
      <div className={tw("storage-meter")}><i><b style={{ width: `${Math.max(2, usagePercent)}%` }} /></i><span>حدود {(storage.quota / 1024 / 1024 / 1024).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} گیگابایت سهمیه تقریبی مرورگر</span></div>
      <Button className={tw("full")} onClick={() => void requestPersistence()}><ShieldCheck /> {storage.persisted ? "ذخیره پایدار فعال است" : "درخواست ذخیره پایدار"}</Button>
      <p className={tw("helper")}><Info />سیستم‌عامل یا مرورگر ممکن است در شرایط کمبود فضا داده‌های محلی را پاک کند؛ پشتیبان منظم توصیه می‌شود.</p>
    </section>
  );
}
