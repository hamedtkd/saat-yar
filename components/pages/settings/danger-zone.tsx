import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createInitialData } from "@/lib/constants";
import type { AppData } from "@/lib/types";
import { cn } from "@/lib/cn";

export function DangerZone({ setData, setToast }: { setData: React.Dispatch<React.SetStateAction<AppData>>; setToast: (message: string) => void }) {
  return (
    <section id="settings-danger" className={cn("scroll-mt-24 dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] shadow-[0_5px_16px_rgba(0,0,0,.03)] p-4", "col-span-full flex items-center justify-between gap-5 border-[color-mix(in_srgb,var(--danger)_35%,var(--border))] bg-[var(--danger-soft)] max-[620px]:col-auto max-[620px]:items-stretch max-[620px]:flex-col [&>div]:flex [&>div]:items-center [&>div]:gap-[11px] [&>div>svg]:h-7 [&>div>svg]:w-7 [&>div>svg]:text-[var(--danger)] [&>div>div]:grid [&_span]:text-[10px] [&_span]:text-[var(--text-muted)]")}>
      <div><AlertTriangle /><div><strong>پاک‌کردن همه داده‌ها</strong><span>این عملیات قابل بازگشت نیست؛ ابتدا پشتیبان بگیر.</span></div></div>
      <Button variant="destructive" onClick={() => { if (confirm("تمام اطلاعات ساعت‌یار برای همیشه پاک شود؟")) { setData(createInitialData({ onboarded: true })); setToast("همه داده‌ها پاک شدند"); } }}><Trash2 /> پاک‌کردن همه داده‌ها</Button>
    </section>
  );
}
