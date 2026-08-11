"use client";

import { Download } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { Button } from "@/components/ui/button";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { cn } from "@/lib/cn";

export function BackupCard({ exportBackup }: { exportBackup: () => void }) {
  const { s } = useSystemUi();
  return (
    <section id="settings-backup" className={cn("scroll-mt-24 dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] shadow-[0_5px_16px_rgba(0,0,0,.03)] p-4", "p-5")}>
      <PanelHead icon={<Download />} title={s("Backup")} />
      <p>{s("Download a versioned JSON snapshot of the latest app state.")}</p>
      <Button variant="outline" className={cn("w-full")} onClick={exportBackup}><Download /> {s("Download backup file")}</Button>
    </section>
  );
}
