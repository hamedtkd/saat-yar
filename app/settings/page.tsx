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
      onModeChange={controller.changeMode}
      setToast={controller.setToast}
      financialsHidden={controller.financialsHidden}
    />
  );
}
