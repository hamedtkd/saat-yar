"use client";
import { RefreshCw, Save } from "lucide-react";
import { FloatingNotice } from "@/components/common/floating-notice";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { Button } from "@/components/ui/button";
export function MultiTabSyncBanner({ pending, onReload, onKeepLocal }: { pending: boolean; onReload: () => void; onKeepLocal: () => void }) {
  const { s } = useSystemUi();
  if (!pending) return null;
  return <FloatingNotice className="translate-y-20 sm:translate-y-24" tone="warning" icon={<RefreshCw className="size-4.5" />} title={s("Data changed in another tab")} description={s("Choose which version to keep. Your local changes are saved to a recovery snapshot before resolving this conflict.")} action={<div className="flex flex-wrap items-center gap-2"><Button size="sm" variant="outline" onClick={onKeepLocal}><Save /> {s("Keep my changes (replace newer version)")}</Button><Button size="sm" onClick={onReload}><RefreshCw /> {s("Load new version (discard local changes)")}</Button></div>} />;
}
