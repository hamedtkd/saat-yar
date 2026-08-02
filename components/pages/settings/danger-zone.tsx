import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultSettings } from "@/lib/constants";
import type { AppData } from "@/lib/types";
import { cn } from "@/lib/cn";

export function DangerZone({ setData, setToast }: { setData: React.Dispatch<React.SetStateAction<AppData>>; setToast: (message: string) => void }) {
  return (
    <section className={cn("rounded-[15px] border border-[#dfe7e9] bg-white/95 shadow-[0_10px_35px_rgba(17,45,55,.055)] p-4", "col-span-full flex items-center justify-between gap-5 border-[#ffd0cb] bg-[#fffafa] max-[620px]:col-auto max-[620px]:items-stretch max-[620px]:flex-col [&>div]:flex [&>div]:items-center [&>div]:gap-[11px] [&>div>svg]:h-7 [&>div>svg]:w-7 [&>div>svg]:text-[#e54845] [&>div>div]:grid [&_span]:text-[10px] [&_span]:text-[#6c7d89]")}>
      <div><AlertTriangle /><div><strong>پاک‌کردن همه داده‌ها</strong><span>این عملیات قابل بازگشت نیست؛ ابتدا پشتیبان بگیر.</span></div></div>
      <Button variant="destructive" onClick={() => { if (confirm("تمام اطلاعات ساعت‌یار برای همیشه پاک شود؟")) { setData({ settings: { ...defaultSettings, onboarded: true }, records: {}, leaves: [], clients: [], projects: [], timeEntries: [] }); setToast("همه داده‌ها پاک شدند"); } }}><Trash2 /> پاک‌کردن همه داده‌ها</Button>
    </section>
  );
}
