"use client";

import { AlertTriangle, History, RefreshCcw, RotateCcw, Trash2 } from "lucide-react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { PanelHead } from "@/components/common/panel-head";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { RecoverySnapshot } from "@/lib/recovery";
import type { SaveState } from "@/hooks/use-persisted-app-data";

export function RecoveryCard({ saveState, lastSavedAt, saveError, recoverySnapshot, retrySave, createRecovery, restoreRecovery, clearRecovery }: {
  saveState: SaveState;
  lastSavedAt: string | null;
  saveError: string;
  recoverySnapshot: RecoverySnapshot | null;
  retrySave: () => Promise<void>;
  createRecovery: () => void;
  restoreRecovery: () => void;
  clearRecovery: () => void;
}) {
  const { date, s } = useSystemUi();
  const formatSavedAt = (value: string | null) => value ? date(new Date(value), { dateStyle: "short", timeStyle: "medium" }) : s("Not saved yet");
  const stateLabel = { idle: s("Ready"), saving: s("Saving"), saved: s("Saved"), error: s("Save error") }[saveState];
  return (
    <section id="settings-recovery" className={cn("scroll-mt-24 dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-5 shadow-[0_5px_16px_rgba(0,0,0,.03)]")}>
      <PanelHead icon={<History />} title={s("Recovery and save health")} />
      <dl className="m-0 mb-4 grid gap-2 text-[11px] [&>div]:flex [&>div]:justify-between [&>div]:gap-3 [&_dt]:text-[var(--text-muted)] [&_dd]:m-0 [&_dd]:font-bold">
        <div><dt>{s("Save status")}</dt><dd className={saveState === "error" ? "text-[var(--danger)]" : "text-[var(--accent-strong)]"}>{stateLabel}</dd></div>
        <div><dt>{s("Last primary save")}</dt><dd>{formatSavedAt(lastSavedAt)}</dd></div>
        <div><dt>{s("Last recovery snapshot")}</dt><dd>{recoverySnapshot ? formatSavedAt(recoverySnapshot.savedAt) : s("Does not exist")}</dd></div>
      </dl>
      {saveError && <p role="alert" className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[10px] font-semibold leading-7 text-red-700"><AlertTriangle className="mt-1 flex-none" />{saveError}</p>}
      <div className="grid grid-cols-2 gap-2 max-[520px]:grid-cols-1">
        <Button variant="outline" onClick={() => void retrySave()}><RefreshCcw /> {s("Try again")}</Button>
        <Button variant="outline" onClick={createRecovery}><History /> {s("Create recovery snapshot")}</Button>
        <Button variant="outline" disabled={!recoverySnapshot} onClick={restoreRecovery}><RotateCcw /> {s("Restore local snapshot")}</Button>
        <Button variant="outline" disabled={!recoverySnapshot} onClick={clearRecovery}><Trash2 /> {s("Delete recovery snapshot")}</Button>
      </div>
      <p className="mt-3 text-[10px] leading-7 text-[var(--text-muted)]">{s("The recovery snapshot is stored only in this browser and is useful after an interrupted or failed save. It is not a replacement for an external backup.")}</p>
    </section>
  );
}
