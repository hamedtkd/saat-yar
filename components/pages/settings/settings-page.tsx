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
  return <>
    <PageHeading autosave={false} title="تنظیمات و داده‌ها" description="ظاهر، برنامه کاری، رفتار ذخیره و داده‌های محلی ساعت‌یار را از یک مرکز منظم مدیریت کن." />
    <SettingsSearch />
    <section className={cn("grid grid-cols-[250px_minmax(0,1fr)] gap-5 max-[900px]:grid-cols-1") }>
      <SettingsNav />
      <div className="grid min-w-0 gap-5">
        <span id="settings-general" className="block scroll-mt-24" aria-hidden="true" />
        <SettingsSection icon={<SlidersHorizontal />} eyebrow="شخصی‌سازی" title="عمومی و ظاهر" description="هویت کاربر، تم، رنگ و رفتار ذخیره تنظیمات.">
          <OnboardingReentryCard startOnboardingReentry={startOnboardingReentry} />
          <ProfileSettingsCard data={data} setData={setData} setToast={setToast} />
          <AppearanceSettingsCard data={data} setData={setData} setToast={setToast} />
          <SettingsBehaviorCard data={data} setData={setData} setToast={setToast} />
        </SettingsSection>

        <span id="settings-data" className="block scroll-mt-24" aria-hidden="true" />
        <SettingsSection icon={<Database />} eyebrow="Local-first" title="داده و پشتیبان" description="سلامت داده، فضای ذخیره‌سازی، بازیابی و فایل‌های پشتیبان.">
          <DataHealthCard records={data.records} syncStatus={multiTabSyncStatus} clearSyncHistory={clearMultiTabSyncHistory} />
          <RecordRecycleBinCard data={data} setData={setData} setToast={setToast} />
          <StorageCard storage={storage} requestPersistence={requestPersistence} />
          <RecoveryCard saveState={saveState} lastSavedAt={lastSavedAt} saveError={saveError} recoverySnapshot={recoverySnapshot} retrySave={retrySave} createRecovery={createRecovery} restoreRecovery={restoreRecovery} clearRecovery={clearRecovery} />
          <BackupCard exportBackup={exportBackup} />
          <RestoreCard previewImport={previewImport} importPreview={importPreview} applyImport={applyImport} />
          <DeviceTransferCard data={data} setData={setData} setToast={setToast} />
        </SettingsSection>

        <span id="settings-work" className="block scroll-mt-24" aria-hidden="true" />
        <SettingsSection icon={<CalendarClock />} eyebrow="قوانین کار" title="برنامه کاری و حقوق" description="هدف‌ها، تقویم، مزایا و اعلان‌های مرتبط با روز کاری.">
          <WorkSettingsCard data={data} setData={setData} setToast={setToast} />
          <HolidayOverridesCard data={data} setData={setData} setToast={setToast} />
          <PayrollPolicyCard data={data} setData={setData} setToast={setToast} financialsHidden={financialsHidden} />
          <PayrollSettingsCard data={data} setData={setData} setToast={setToast} financialsHidden={financialsHidden} />
          <NotificationSettingsCard data={data} setData={setData} requestPermission={requestNotificationPermission} setToast={setToast} />
        </SettingsSection>

        <span id="settings-about" className="block scroll-mt-24" aria-hidden="true" />
        <SettingsSection icon={<ShieldCheck />} eyebrow="ایمنی" title="عملیات حساس" description="ابزارهای بازنشانی داده با تأیید صریح و کنترل‌شده.">
          <DangerZone setData={setData} setToast={setToast} />
        </SettingsSection>
      </div>
    </section>
  </>;
}
