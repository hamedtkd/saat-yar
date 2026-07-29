import { Download } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { Button } from "@/components/ui/button";
import { tw } from "@/lib/tw";

export function BackupCard({ exportBackup }: { exportBackup: () => void }) {
  return <section className={tw("panel", "settings-card")}><PanelHead icon={<Download />} title="پشتیبان‌گیری" /><p>آخرین وضعیت برنامه را به‌صورت JSON نسخه‌بندی‌شده دانلود کن.</p><Button variant="outline" className={tw("full")} onClick={exportBackup}><Download /> دانلود فایل پشتیبان</Button></section>;
}
