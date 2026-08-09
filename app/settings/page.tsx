"use client";

import { SettingsPage } from "@/components/pages/settings/settings-page";
import { useSaatyarContext } from "@/components/saatyar-shell";

export default function SettingsRoute() {
  const controller = useSaatyarContext();
  if (!controller.ready) return null;

  return (
    <SettingsPage
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
    />
  );
}
