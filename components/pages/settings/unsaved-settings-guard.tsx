"use client";

import { useEffect, useState } from "react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
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

export function UnsavedSettingsDialog({ pendingNavigation, setPendingNavigation, saveAll, discardAll, dirtyLabels = [] }: {
  pendingNavigation: PendingSettingsNavigation;
  setPendingNavigation: (value: PendingSettingsNavigation) => void;
  saveAll: () => void;
  discardAll: () => void;
  dirtyLabels?: string[];
}) {
  const { s } = useSystemUi();
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
          <AlertDialogTitle>{s("You have unsaved changes")}</AlertDialogTitle>
          <AlertDialogDescription>{s("Before moving to another section or date, save your edits or continue without saving.")}</AlertDialogDescription>
          {dirtyLabels.length > 0 && <ul className="grid gap-1 rounded-xl bg-[var(--surface-2)] p-3 text-xs text-[var(--text)]">{dirtyLabels.map((label) => <li key={label}>• {label}</li>)}</ul>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => continueNavigation("save")}>{s("Save and continue")}</AlertDialogAction>
          <AlertDialogAction className="border border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)] hover:brightness-95" onClick={() => continueNavigation("discard")}>{s("Continue without saving")}</AlertDialogAction>
          <AlertDialogCancel>{s("Stay here")}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
