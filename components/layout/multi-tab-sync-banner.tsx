"use client";
import { RefreshCw, X } from "lucide-react";
import { FloatingNotice } from "@/components/common/floating-notice";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { Button } from "@/components/ui/button";
export function MultiTabSyncBanner({ pending, onReload, onDismiss }: { pending: boolean; onReload: () => void; onDismiss: () => void }) {
  const { s } = useSystemUi();
  if (!pending) return null;
  return <FloatingNotice className="translate-y-20 sm:translate-y-24" tone="warning" icon={<RefreshCw className="size-4.5" />} title={s("Data changed in another tab")} description={s("To avoid overwriting changes, load the new version after saving or discarding your current edits.")} action={<div className="flex items-center gap-2"><Button size="sm" onClick={onReload}><RefreshCw /> {s("Load new version")}</Button><Button size="icon" variant="ghost" aria-label={s("Close sync message")} onClick={onDismiss}><X /></Button></div>} />;
}
