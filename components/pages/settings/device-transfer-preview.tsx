"use client";

import { AlertTriangle, ArrowDownToLine, GitMerge, ShieldCheck, XCircle } from "lucide-react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { Button } from "@/components/ui/button";
import type { SystemMessageKey } from "@/lib/i18n/system";
import type { DeviceTransferConflictResolution, DeviceTransferPreview } from "@/lib/device-transfer-types";

const labelKeys: Record<string, SystemMessageKey> = {
  records: "Work records",
  leaves: "Leave",
  clients: "Clients",
  projects: "Projects",
  timeEntries: "Time entries",
  expenses: "Expenses",
  invoices: "Invoices",
  holidayOverrides: "Manual holidays",
  deletedRecords: "Recycle bin",
};

export function DeviceTransferPreviewPanel({ preview, sourceName, onApply, onCancel }: {
  preview: DeviceTransferPreview;
  sourceName: string;
  onApply: (mode: "merge" | "replace", conflicts: DeviceTransferConflictResolution) => void;
  onCancel: () => void;
}) {
  const { number, s } = useSystemUi();
  const additions = Object.values(preview.collections).reduce((sum, item) => sum + item.additions, 0);
  return (
    <div className="mt-4 rounded-2xl border border-[var(--accent)] bg-[var(--accent-soft)] p-4">
      <div className="mb-3 flex items-start gap-3">
        <ShieldCheck className="mt-0.5 size-5 flex-none text-[var(--accent-strong)]" />
        <div>
          <strong className="block text-sm">{s("Transfer from {device} is ready to review", { device: sourceName })}</strong>
          <p className="mt-1 text-[10px] leading-6 text-[var(--text-muted)]">{s("Checksum and decryption passed. Choose how to merge before saving.")}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 max-[520px]:grid-cols-1">
        <div className="rounded-xl bg-[var(--surface-1)] p-3 text-center"><b>{number(additions)}</b><span className="block text-[10px] text-[var(--text-muted)]">{s("New data")}</span></div>
        <div className="rounded-xl bg-[var(--surface-1)] p-3 text-center"><b>{number(preview.conflictCount)}</b><span className="block text-[10px] text-[var(--text-muted)]">{s("Conflicts")}</span></div>
        <div className="rounded-xl bg-[var(--surface-1)] p-3 text-center"><b>{preview.settingsChanged ? s("Changed") : s("Same")}</b><span className="block text-[10px] text-[var(--text-muted)]">{s("Settings")}</span></div>
      </div>
      <div className="mt-3 grid gap-1 text-[10px] text-[var(--text-muted)]">
        {Object.entries(preview.collections).filter(([, item]) => item.additions || item.conflicts).map(([key, item]) => (
          <div key={key} className="flex justify-between rounded-lg bg-[var(--surface-1)] px-3 py-2">
            <span>{labelKeys[key] ? s(labelKeys[key]) : key}</span><span>{s("+{additions} new · {conflicts} conflicts", { additions: number(item.additions), conflicts: number(item.conflicts) })}</span>
          </div>
        ))}
      </div>
      {preview.conflictCount > 0 && <p className="mt-3 flex items-start gap-2 text-[10px] leading-6 text-[var(--warning)]"><AlertTriangle className="mt-0.5 size-4 flex-none" />{s("In safe merge, conflicts stay on this device. Use Incoming wins only when the other device is the source of truth.")}</p>}
      <div className="mt-4 grid grid-cols-3 gap-2 max-[700px]:grid-cols-1">
        <Button size="sm" onClick={() => onApply("merge", "keep-local")}><GitMerge /> {s("Safe merge")}</Button>
        <Button size="sm" variant="secondary" onClick={() => onApply("merge", "use-incoming")}><ArrowDownToLine /> {s("Incoming wins")}</Button>
        <Button size="sm" variant="destructive" onClick={() => onApply("replace", "use-incoming")}><AlertTriangle /> {s("Full replacement")}</Button>
      </div>
      <Button size="sm" variant="ghost" className="mt-2 w-full" onClick={onCancel}><XCircle /> {s("Reject transfer and end session")}</Button>
    </div>
  );
}
