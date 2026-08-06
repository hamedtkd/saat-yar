"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUnsavedSettings } from "@/hooks/settings/use-unsaved-settings";

export type PendingSettingsNavigation = null | (() => void);

export function useSettingsNavigationGuard() {
  const [pendingNavigation, setPendingNavigation] = useState<PendingSettingsNavigation>(null);
  const unsaved = useUnsavedSettings();

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!unsaved.hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [unsaved.hasUnsavedChanges]);

  const requestNavigation = (navigate: () => void) => {
    if (!unsaved.hasUnsavedChanges) navigate();
    else setPendingNavigation(() => navigate);
  };

  return { pendingNavigation, setPendingNavigation, requestNavigation, unsaved };
}

export function UnsavedSettingsDialog({
  pendingNavigation,
  setPendingNavigation,
  saveAll,
  discardAll,
  dirtyLabels = [],
}: {
  pendingNavigation: PendingSettingsNavigation;
  setPendingNavigation: (value: PendingSettingsNavigation) => void;
  saveAll: () => void;
  discardAll: () => void;
  dirtyLabels?: string[];
}) {
  const continueNavigation = (mode: "save" | "discard") => {
    if (mode === "save") saveAll();
    else discardAll();
    const navigate = pendingNavigation;
    setPendingNavigation(null);
    navigate?.();
  };

  return (
    <AlertDialog open={Boolean(pendingNavigation)} onOpenChange={(open: boolean) => !open && setPendingNavigation(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>تغییرات ذخیره‌نشده داری</AlertDialogTitle>
          <AlertDialogDescription>
            قبل از رفتن به بخش یا تاریخ دیگر، تغییرات در حال ویرایش را ذخیره کن یا بدون ذخیره ادامه بده.
          </AlertDialogDescription>
          {dirtyLabels.length > 0 && (
            <ul className="grid gap-1 rounded-xl bg-[var(--surface-2)] p-3 text-xs text-[var(--text)]">
              {dirtyLabels.map((label) => <li key={label}>• {label}</li>)}
            </ul>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => continueNavigation("save")}>ذخیره و ادامه</AlertDialogAction>
          <AlertDialogAction className="border border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)] hover:brightness-95" onClick={() => continueNavigation("discard")}>بدون ذخیره ادامه بده</AlertDialogAction>
          <AlertDialogCancel>ماندن در این بخش</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
