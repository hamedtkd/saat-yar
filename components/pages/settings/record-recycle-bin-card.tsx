"use client";

import { RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { activeDeletedRecords, expiredDeletedRecords, permanentlyDeleteRecord, purgeExpiredDeletedRecords, restoreAllDeletedRecords, restoreDeletedRecord } from "@/lib/record-recycle-bin";
import type { AppData } from "@/lib/types";

function remainingDays(expiresAt: string) { return Math.max(1, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000)); }

export function RecordRecycleBinCard({ data, setData, setToast }: { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; setToast: (message: string) => void }) {
  const { date, number, s } = useSystemUi();
  const [deleteId, setDeleteId] = useState("");
  const [confirmExpiredCleanup, setConfirmExpiredCleanup] = useState(false);
  const items = activeDeletedRecords(data.deletedRecords);
  const expiredItems = expiredDeletedRecords(data.deletedRecords);
  const restorableCount = items.filter((item) => !data.records[item.date]).length;
  function restore(id: string) {
    const item = data.deletedRecords.find((entry) => entry.id === id); if (!item) return;
    if (data.records[item.date]) { setToast(s("An active record already exists for this date; review it first")); return; }
    setData((current) => restoreDeletedRecord(current, id)); setToast(s("Record was restored from the recycle bin"));
  }
  function restoreAll() {
    const result = restoreAllDeletedRecords(data);
    if (result.restoredCount === 0) { setToast(result.blockedCount ? s("Every restorable record conflicts with an active record on the same date") : s("There are no records to restore")); return; }
    setData(result.data);
    setToast(result.blockedCount ? s("{restored} records restored; {blocked} remain because of conflicts", { restored: number(result.restoredCount), blocked: number(result.blockedCount) }) : s("{restored} records restored", { restored: number(result.restoredCount) }));
  }
  function removeForever() { if (!deleteId) return; setData((current) => permanentlyDeleteRecord(current, deleteId)); setToast(s("Record was permanently deleted")); setDeleteId(""); }
  function cleanupExpired() { const result = purgeExpiredDeletedRecords(data); setData(result.data); setToast(s("{count} expired records were permanently deleted", { count: number(result.removedCount) })); setConfirmExpiredCleanup(false); }
  const formatDate = (value: string) => date(value, { weekday: "long", day: "numeric", month: "long" });

  return <section id="settings-recycle" className="col-span-full scroll-mt-24 overflow-hidden dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] shadow-[0_5px_16px_rgba(0,0,0,.03)]">
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] p-5"><div className="grid gap-2"><PanelHead icon={<Trash2 />} title={s("Record recycle bin")} /><p className="text-[10px] leading-5 text-[var(--text-muted)]">{s("Deleted records can be restored for 30 days and are then ready for cleanup.")}</p></div><div className="flex flex-wrap gap-2"><StatusBadge tone={items.length ? "info" : "success"}>{items.length ? s("{count} restorable", { count: number(items.length) }) : s("Active recycle bin is empty")}</StatusBadge>{expiredItems.length > 0 && <StatusBadge tone="warning">{s("{count} expired", { count: number(expiredItems.length) })}</StatusBadge>}</div></div>
    <div className="flex flex-wrap gap-2 border-b border-[var(--border)] p-4 sm:p-5"><Button type="button" variant="outline" disabled={restorableCount === 0} onClick={restoreAll}><RotateCcw /> {s("Restore all")}</Button><Button type="button" variant="destructive" disabled={expiredItems.length === 0} onClick={() => setConfirmExpiredCleanup(true)}><Trash2 /> {s("Clean up expired")}</Button></div>
    {items.length === 0 ? <p className="p-5 text-sm text-[var(--text-muted)]">{s("There is no active record to restore.")}{expiredItems.length ? s(" You can clean up expired records in one action.") : ""}</p> : <div className="grid gap-2 p-4 sm:p-5">{items.map((item) => { const blocked = Boolean(data.records[item.date]); return <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3"><div className="grid gap-1"><strong className="text-xs text-[var(--text)]">{formatDate(item.date)}</strong><span className="text-[10px] text-[var(--text-muted)]">{s("{days} days remaining · in {start} · out {end}", { days: number(remainingDays(item.expiresAt)), start: item.record.start || "—", end: item.record.end || "—" })}</span>{blocked && <span className="text-[10px] font-bold text-[var(--warning)]">{s("An active record now exists for this date.")}</span>}</div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={blocked} onClick={() => restore(item.id)}><RotateCcw /> {s("Restore")}</Button><Button type="button" variant="ghost" className="text-[var(--danger)]" onClick={() => setDeleteId(item.id)}><Trash2 /> {s("Delete forever")}</Button></div></article>; })}</div>}
    <AlertDialog open={Boolean(deleteId)} onOpenChange={(open: boolean) => { if (!open) setDeleteId(""); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{s("Delete record forever?")}</AlertDialogTitle><AlertDialogDescription>{s("This record is also removed from the recycle bin and cannot be restored in the app. Only an older backup might help.")}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{s("Cancel")}</AlertDialogCancel><AlertDialogAction className="bg-[var(--danger)] text-white" onClick={removeForever}>{s("Yes, delete forever")}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <AlertDialog open={confirmExpiredCleanup} onOpenChange={setConfirmExpiredCleanup}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{s("Delete expired records?")}</AlertDialogTitle><AlertDialogDescription>{s("{count} records whose 30-day retention has ended will be permanently deleted. This cannot be undone in the app.", { count: number(expiredItems.length) })}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{s("Cancel")}</AlertDialogCancel><AlertDialogAction className="bg-[var(--danger)] text-white" onClick={cleanupExpired}>{s("Yes, clean up")}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </section>;
}
