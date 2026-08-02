import { Download } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
export function BackupCard({ exportBackup }: { exportBackup: () => void }) {
  return <section className={cn("rounded-[15px] border border-[#dfe7e9] bg-white/95 shadow-[0_10px_35px_rgba(17,45,55,.055)] p-4", "p-5")}><PanelHead icon={<Download />} title="پشتیبان‌گیری" /><p>آخرین وضعیت برنامه را به‌صورت JSON نسخه‌بندی‌شده دانلود کن.</p><Button variant="outline" className={cn("w-full")} onClick={exportBackup}><Download /> دانلود فایل پشتیبان</Button></section>;
}
