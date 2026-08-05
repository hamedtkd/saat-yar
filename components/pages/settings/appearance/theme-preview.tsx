import { Bell, Clock3, Play, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/common/progress-bar";

export function ThemePreview() {
  return (
    <div className="grid gap-3 rounded-[var(--card-radius)] border border-[var(--border)] bg-[var(--page)] p-3">
      <div className="flex items-center justify-between gap-3 rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-1)] p-3">
        <div className="flex items-center gap-2"><span className="grid size-9 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]"><Clock3 className="size-4" /></span><div><strong className="block text-sm">پیش‌نمایش زنده</strong><small className="text-[var(--text-muted)]">کارت‌ها، کنترل‌ها و Accent</small></div></div>
        <Bell className="size-4 text-[var(--text-muted)]" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-1)] p-3"><WalletCards className="mb-3 size-4 text-[var(--accent-strong)]" /><small className="text-[var(--text-muted)]">حقوق امروز</small><strong className="mt-1 block text-lg">۴۸۳٬۱۶۸</strong></div>
        <div className="rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-2)] p-3"><small className="text-[var(--text-muted)]">پیشرفت روز</small><strong className="mt-1 block text-lg">۴۸٪</strong><ProgressBar className="mt-3" value={48} /></div>
      </div>
      <div className="flex flex-wrap gap-2"><Button size="sm"><Play /> شروع</Button><Button size="sm" variant="secondary">ثانویه</Button><Button size="sm" variant="outline">خطی</Button></div>
    </div>
  );
}
