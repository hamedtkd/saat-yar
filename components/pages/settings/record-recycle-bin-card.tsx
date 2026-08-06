"use client";

import { RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { activeDeletedRecords, permanentlyDeleteRecord, restoreDeletedRecord } from "@/lib/record-recycle-bin";
import type { AppData } from "@/lib/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { weekday: "long", day: "numeric", month: "long" })
    .format(new Date(`${value}T12:00:00`));
}

function remainingDays(expiresAt: string) {
  return Math.max(1, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000));
}

export function RecordRecycleBinCard({ data, setData, setToast }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setToast: (message: string) => void;
}) {
  const [deleteId, setDeleteId] = useState("");
  const items = activeDeletedRecords(data.deletedRecords);

  function restore(id: string) {
    const item = data.deletedRecords.find((entry) => entry.id === id);
    if (!item) return;
    if (data.records[item.date]) {
      setToast("برای این تاریخ یک رکورد فعال وجود دارد؛ ابتدا آن را بررسی کنید");
      return;
    }
    setData((current) => restoreDeletedRecord(current, id));
    setToast("رکورد از سطل بازیابی برگردانده شد");
  }

  function removeForever() {
    if (!deleteId) return;
    setData((current) => permanentlyDeleteRecord(current, deleteId));
    setToast("رکورد برای همیشه حذف شد");
    setDeleteId("");
  }

  return <section className="col-span-full overflow-hidden rounded-[15px] border border-[var(--border)] bg-[var(--surface-1)] shadow-[0_6px_20px_rgba(17,45,55,.04)]">
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] p-5">
      <div className="grid gap-2">
        <PanelHead icon={<Trash2 />} title="سطل بازیابی رکوردها" />
        <p className="text-[10px] leading-5 text-[var(--text-muted)]">رکوردهای حذف‌شده تا ۳۰ روز قابل بازگردانی‌اند و سپس منقضی می‌شوند.</p>
      </div>
      <StatusBadge tone={items.length ? "info" : "success"}>{items.length ? `${items.length.toLocaleString("fa-IR")} رکورد` : "خالی"}</StatusBadge>
    </div>

    {items.length === 0 ? (
      <p className="p-5 text-sm text-[var(--text-muted)]">رکورد حذف‌شده‌ای برای بازیابی وجود ندارد.</p>
    ) : (
      <div className="grid gap-2 p-4 sm:p-5">
        {items.map((item) => {
          const blocked = Boolean(data.records[item.date]);
          return <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
            <div className="grid gap-1">
              <strong className="text-xs text-[var(--text)]">{formatDate(item.date)}</strong>
              <span className="text-[10px] text-[var(--text-muted)]">تا {remainingDays(item.expiresAt).toLocaleString("fa-IR")} روز دیگر · ورود {item.record.start || "—"} · خروج {item.record.end || "—"}</span>
              {blocked && <span className="text-[10px] font-bold text-[var(--warning)]">برای این تاریخ اکنون یک رکورد فعال وجود دارد.</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" disabled={blocked} onClick={() => restore(item.id)}><RotateCcw /> بازگردانی</Button>
              <Button type="button" variant="ghost" className="text-[var(--danger)]" onClick={() => setDeleteId(item.id)}><Trash2 /> حذف دائمی</Button>
            </div>
          </article>;
        })}
      </div>
    )}

    <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => { if (!open) setDeleteId(""); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>رکورد برای همیشه حذف شود؟</AlertDialogTitle>
          <AlertDialogDescription>این رکورد از سطل بازیابی هم پاک می‌شود و دیگر از داخل برنامه قابل بازگردانی نیست. فقط فایل پشتیبان قدیمی ممکن است کمک کند.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>انصراف</AlertDialogCancel>
          <AlertDialogAction className="bg-[var(--danger)] text-white" onClick={removeForever}>بله، حذف دائمی</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </section>;
}
