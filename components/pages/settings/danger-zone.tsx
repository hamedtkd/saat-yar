import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultSettings } from "@/lib/constants";
import { tw } from "@/lib/tw";
import type { AppData } from "@/lib/types";

export function DangerZone({ setData, setToast }: { setData: React.Dispatch<React.SetStateAction<AppData>>; setToast: (message: string) => void }) {
  return (
    <section className={tw("panel", "danger-zone")}>
      <div><AlertTriangle /><div><strong>پاک‌کردن همه داده‌ها</strong><span>این عملیات قابل بازگشت نیست؛ ابتدا پشتیبان بگیر.</span></div></div>
      <Button variant="destructive" onClick={() => { if (confirm("تمام اطلاعات ساعت‌یار برای همیشه پاک شود؟")) { setData({ settings: { ...defaultSettings, onboarded: true }, records: {}, leaves: [], clients: [], projects: [], timeEntries: [] }); setToast("همه داده‌ها پاک شدند"); } }}><Trash2 /> پاک‌کردن همه داده‌ها</Button>
    </section>
  );
}
