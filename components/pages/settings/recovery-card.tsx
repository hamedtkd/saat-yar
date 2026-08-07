import { AlertTriangle, History, RefreshCcw, RotateCcw, Trash2 } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { RecoverySnapshot } from "@/lib/recovery";
import type { SaveState } from "@/hooks/use-persisted-app-data";

function formatSavedAt(value: string | null) {
  if (!value) return "هنوز ذخیره نشده";
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}

export function RecoveryCard({
  saveState,
  lastSavedAt,
  saveError,
  recoverySnapshot,
  retrySave,
  createRecovery,
  restoreRecovery,
  clearRecovery,
}: {
  saveState: SaveState;
  lastSavedAt: string | null;
  saveError: string;
  recoverySnapshot: RecoverySnapshot | null;
  retrySave: () => Promise<void>;
  createRecovery: () => void;
  restoreRecovery: () => void;
  clearRecovery: () => void;
}) {
  const stateLabel = {
    idle: "آماده",
    saving: "در حال ذخیره",
    saved: "ذخیره شده",
    error: "خطای ذخیره",
  }[saveState];

  return (
    <section className={cn("dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-5 shadow-[0_5px_16px_rgba(0,0,0,.03)]")}>
      <PanelHead icon={<History />} title="بازیابی و سلامت ذخیره" />
      <dl className="m-0 mb-4 grid gap-2 text-[11px] [&>div]:flex [&>div]:justify-between [&>div]:gap-3 [&_dt]:text-[var(--text-muted)] [&_dd]:m-0 [&_dd]:font-bold">
        <div><dt>وضعیت ذخیره</dt><dd className={saveState === "error" ? "text-[var(--danger)]" : "text-[var(--accent-strong)]"}>{stateLabel}</dd></div>
        <div><dt>آخرین ذخیره اصلی</dt><dd>{formatSavedAt(lastSavedAt)}</dd></div>
        <div><dt>آخرین نسخه بازیابی</dt><dd>{recoverySnapshot ? formatSavedAt(recoverySnapshot.savedAt) : "وجود ندارد"}</dd></div>
      </dl>

      {saveError && (
        <p role="alert" className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[10px] font-semibold leading-7 text-red-700">
          <AlertTriangle className="mt-1 flex-none" />
          {saveError}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 max-[520px]:grid-cols-1">
        <Button variant="outline" onClick={() => void retrySave()}><RefreshCcw /> تلاش دوباره</Button>
        <Button variant="outline" onClick={createRecovery}><History /> ساخت نسخه بازیابی</Button>
        <Button variant="outline" disabled={!recoverySnapshot} onClick={restoreRecovery}><RotateCcw /> بازگردانی نسخه محلی</Button>
        <Button variant="outline" disabled={!recoverySnapshot} onClick={clearRecovery}><Trash2 /> حذف نسخه بازیابی</Button>
      </div>
      <p className="mt-3 text-[10px] leading-7 text-[var(--text-muted)]">نسخه بازیابی داخل همین مرورگر نگه‌داری می‌شود و جای فایل پشتیبان دانلودی را نمی‌گیرد.</p>
    </section>
  );
}
