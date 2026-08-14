"use client";

import { CalendarClock, Database, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import type { AppData, StorageInfo } from "@/lib/types";
import { BackupCard } from "./backup-card";
import { DangerZone } from "./danger-zone";
import { RestoreCard } from "./restore-card";
import { StorageCard } from "./storage-card";
import { WorkSettingsCard } from "./work-settings-card";
import { HolidayOverridesCard } from "./holiday-overrides-card";
import { PayrollSettingsCard } from "./payroll-settings-card";
import { PayrollPolicyCard } from "./payroll-policy-card";
import { NotificationSettingsCard } from "./notification-settings-card";
import { cn } from "@/lib/cn";
import { SettingsNav } from "./settings-nav";
import type { RecoverySnapshot } from "@/lib/recovery";
import type { SaveState } from "@/hooks/use-persisted-app-data";
import { RecoveryCard } from "./recovery-card";
import { AppearanceSettingsCard } from "./appearance/appearance-settings-card";
import { SettingsBehaviorCard } from "./settings-behavior-card";
import { ProfileSettingsCard } from "./profile-settings-card";
import { DataHealthCard } from "./data-health-card";
import { DeviceTransferCard } from "./device-transfer-card";
import type { MultiTabSyncStatus } from "@/lib/multi-tab-sync-status";
import { RecordRecycleBinCard } from "./record-recycle-bin-card";
import { SettingsSection } from "./settings-section";
import { SettingsSearch } from "./settings-search";
import { OnboardingReentryCard } from "./onboarding-reentry-card";
import { LanguageSettingsCard } from "./language-settings-card";
import { useLocale } from "@/components/i18n/locale-provider";

export function SettingsPage({ data, setData, storage, exportBackup, previewImport, importPreview, applyImport, requestPersistence, requestNotificationPermission, setToast, financialsHidden, saveState, lastSavedAt, saveError, recoverySnapshot, retrySave, createRecovery, restoreRecovery, clearRecovery, multiTabSyncStatus, clearMultiTabSyncHistory, startOnboardingReentry }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  storage: StorageInfo;
  exportBackup: () => void;
  previewImport: (file?: File) => void;
  importPreview: AppData | null;
  applyImport: (mode: "merge" | "replace") => Promise<void>;
  requestPersistence: () => Promise<void>;
  requestNotificationPermission: () => Promise<boolean>;
  setToast: (message: string) => void;
  financialsHidden: boolean;
  saveState: SaveState;
  lastSavedAt: string | null;
  saveError: string;
  recoverySnapshot: RecoverySnapshot | null;
  retrySave: () => Promise<void>;
  createRecovery: () => void;
  restoreRecovery: () => void;
  clearRecovery: () => void;
  multiTabSyncStatus: MultiTabSyncStatus;
  clearMultiTabSyncHistory: () => void;
  startOnboardingReentry: () => void;
}) {
  const { t } = useLocale();
  return <>
    <PageHeading autosave={false} title={t("settings.title")} description={t("settings.description")} />
    <SettingsSearch />
    <section className={cn("grid grid-cols-[250px_minmax(0,1fr)] gap-5 max-[900px]:grid-cols-1 max-[900px]:gap-3") }>
      <SettingsNav />
      <div className="grid min-w-0 gap-5">
        <span id="settings-general" className="block scroll-mt-24" aria-hidden="true" />
        <SettingsSection icon={<SlidersHorizontal />} eyebrow={t("settings.general.eyebrow")} title={t("settings.general.title")} description={t("settings.general.description")}>
          <OnboardingReentryCard startOnboardingReentry={startOnboardingReentry} />
          <ProfileSettingsCard data={data} setData={setData} setToast={setToast} />
          <LanguageSettingsCard />
          <AppearanceSettingsCard data={data} setData={setData} setToast={setToast} />
          <SettingsBehaviorCard data={data} setData={setData} setToast={setToast} />
        </SettingsSection>

        <span id="settings-data" className="block scroll-mt-24" aria-hidden="true" />
        <SettingsSection icon={<Database />} eyebrow={t("settings.data.eyebrow")} title={t("settings.data.title")} description={t("settings.data.description")}>
          <DataHealthCard records={data.records} syncStatus={multiTabSyncStatus} clearSyncHistory={clearMultiTabSyncHistory} />
          <RecordRecycleBinCard data={data} setData={setData} setToast={setToast} />
          <StorageCard storage={storage} requestPersistence={requestPersistence} />
          <RecoveryCard saveState={saveState} lastSavedAt={lastSavedAt} saveError={saveError} recoverySnapshot={recoverySnapshot} retrySave={retrySave} createRecovery={createRecovery} restoreRecovery={restoreRecovery} clearRecovery={clearRecovery} />
          <BackupCard exportBackup={exportBackup} />
          <RestoreCard previewImport={previewImport} importPreview={importPreview} applyImport={applyImport} />
          <DeviceTransferCard data={data} setData={setData} setToast={setToast} />
        </SettingsSection>

        <span id="settings-work" className="block scroll-mt-24" aria-hidden="true" />
        <SettingsSection icon={<CalendarClock />} eyebrow={t("settings.work.eyebrow")} title={t("settings.work.title")} description={t("settings.work.description")}>
          <WorkSettingsCard data={data} setData={setData} setToast={setToast} />
          <HolidayOverridesCard data={data} setData={setData} setToast={setToast} />
          <PayrollPolicyCard data={data} setData={setData} setToast={setToast} financialsHidden={financialsHidden} />
          <PayrollSettingsCard data={data} setData={setData} setToast={setToast} financialsHidden={financialsHidden} />
          <NotificationSettingsCard data={data} setData={setData} requestPermission={requestNotificationPermission} setToast={setToast} />
        </SettingsSection>

        <span id="settings-about" className="block scroll-mt-24" aria-hidden="true" />
        <SettingsSection icon={<ShieldCheck />} eyebrow={t("settings.safety.eyebrow")} title={t("settings.safety.title")} description={t("settings.safety.description")}>
          <DangerZone setData={setData} setToast={setToast} />
        </SettingsSection>
      </div>
    </section>
  </>;
}
