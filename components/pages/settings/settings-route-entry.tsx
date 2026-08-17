"use client";

import { useSaatyarContext } from "@/components/saatyar-shell";
import { SettingsPage } from "./settings-page";
import type { SettingsRouteId } from "./settings-route-model";

export function SettingsRouteEntry({ route }: { route: SettingsRouteId }) {
  const controller = useSaatyarContext();
  if (!controller.ready) return null;
  return <SettingsPage
    route={route}
    data={controller.data}
    setData={controller.setData}
    storage={controller.storageInfo}
    exportBackup={controller.exportBackup}
    previewImport={controller.previewImport}
    importPreview={controller.importPreview}
    applyImport={controller.applyImport}
    requestPersistence={controller.requestPersistence}
    requestNotificationPermission={controller.requestNotificationPermission}
    setToast={controller.setToast}
    financialsHidden={controller.financialsHidden}
    saveState={controller.saveState}
    lastSavedAt={controller.lastSavedAt}
    saveError={controller.saveError}
    recoverySnapshot={controller.recoverySnapshot}
    retrySave={controller.retrySave}
    createRecovery={() => { controller.createManualRecovery(); }}
    restoreRecovery={() => { controller.restoreRecovery(); }}
    clearRecovery={() => { controller.clearRecovery(); }}
    multiTabSyncStatus={controller.multiTabSyncStatus}
    clearMultiTabSyncHistory={controller.clearMultiTabSyncHistory}
    startOnboardingReentry={controller.startOnboardingReentry}
  />;
}
