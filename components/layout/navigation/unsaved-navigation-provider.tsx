"use client";

import { createContext, useContext } from "react";
import { useBrowserHistoryGuard } from "./use-browser-history-guard";
import {
  UnsavedSettingsDialog,
  useSettingsNavigationGuard,
} from "@/components/pages/settings/unsaved-settings-guard";

type UnsavedNavigationContextValue = {
  requestNavigation: (navigate: () => void) => void;
  hasUnsavedChanges: boolean;
};

const UnsavedNavigationContext = createContext<UnsavedNavigationContextValue | null>(null);

export function UnsavedNavigationProvider({ children }: { children: React.ReactNode }) {
  const guard = useSettingsNavigationGuard();
  useBrowserHistoryGuard({
    hasUnsavedChanges: guard.unsaved.hasUnsavedChanges,
    requestNavigation: guard.requestNavigation,
  });

  return (
    <UnsavedNavigationContext.Provider
      value={{
        requestNavigation: guard.requestNavigation,
        hasUnsavedChanges: guard.unsaved.hasUnsavedChanges,
      }}
    >
      {children}
      <UnsavedSettingsDialog
        pendingNavigation={guard.pendingNavigation}
        setPendingNavigation={guard.setPendingNavigation}
        saveAll={guard.unsaved.saveAll}
        discardAll={guard.unsaved.discardAll}
        dirtyLabels={guard.unsaved.dirtyLabels}
      />
    </UnsavedNavigationContext.Provider>
  );
}

export function useUnsavedNavigation() {
  const context = useContext(UnsavedNavigationContext);
  if (!context) throw new Error("useUnsavedNavigation must be used within UnsavedNavigationProvider");
  return context;
}
