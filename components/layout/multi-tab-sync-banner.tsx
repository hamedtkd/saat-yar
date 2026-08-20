"use client";
import { RefreshCw, X } from "lucide-react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { Button } from "@/components/ui/button";
export function MultiTabSyncBanner({ pending, onReload, onDismiss }: { pending: boolean; onReload: () => void; onDismiss: () => void }) {
  const { s } = useSystemUi();
  if (!pending) return null;
  return <section className="shell-main-offset mx-auto mb-4 flex max-w-[var(--shell-content-max)] flex-wrap items-center justify-between gap-3 max-[359px]:gap-2 max-[359px]:px-3 rounded-[var(--card-radius)] border border-[color-mix(in_srgb,var(--warning)_32%,var(--border))] bg-[var(--warning-soft)] px-4 py-3 text-[var(--text)]" role="status" aria-live="polite"><div className="grid gap-1"><strong className="text-sm">{s("Data changed in another tab")}</strong><span className="text-xs text-[var(--text-muted)]">{s("To avoid overwriting changes, load the new version after saving or discarding your current edits.")}</span></div><div className="flex items-center gap-2"><Button size="sm" onClick={onReload}><RefreshCw /> {s("Load new version")}</Button><Button size="icon" variant="ghost" aria-label={s("Close sync message")} onClick={onDismiss}><X /></Button></div></section>;
}
