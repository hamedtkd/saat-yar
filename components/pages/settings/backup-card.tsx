import { Download } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
export function BackupCard({ exportBackup }: { exportBackup: () => void }) {
  return <section className={cn("dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] shadow-[0_5px_16px_rgba(0,0,0,.03)] p-4", "p-5")}><PanelHead icon={<Download />} title="پشتیبان‌گیری" /><p>آخرین وضعیت برنامه را به‌صورت JSON نسخه‌بندی‌شده دانلود کن.</p><Button variant="outline" className={cn("w-full")} onClick={exportBackup}><Download /> دانلود فایل پشتیبان</Button></section>;
}
