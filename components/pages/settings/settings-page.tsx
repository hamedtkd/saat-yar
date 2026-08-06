import { PageHeading } from "@/components/common/page-heading";
import type { AppData, Mode, StorageInfo } from "@/lib/types";
import { BackupCard } from "./backup-card";
import { DangerZone } from "./danger-zone";
import { RestoreCard } from "./restore-card";
import { StorageCard } from "./storage-card";
import { WorkSettingsCard } from "./work-settings-card";
import { HolidayOverridesCard } from "./holiday-overrides-card";
import { PayrollSettingsCard } from "./payroll-settings-card";
import { NotificationSettingsCard } from "./notification-settings-card";
import { cn } from "@/lib/cn";
import { SettingsNav } from "./settings-nav";
import type { RecoverySnapshot } from "@/lib/recovery";
import type { SaveState } from "@/hooks/use-persisted-app-data";
import { RecoveryCard } from "./recovery-card";
import { AppearanceSettingsCard } from "./appearance/appearance-settings-card";
import { SettingsBehaviorCard } from "./settings-behavior-card";
import { ProfileSettingsCard } from "./profile-settings-card";

export function SettingsPage({ data, setData, storage, exportBackup, previewImport, importPreview, applyImport, requestPersistence, requestNotificationPermission, onModeChange, setToast, financialsHidden, saveState, lastSavedAt, saveError, recoverySnapshot, retrySave, createRecovery, restoreRecovery, clearRecovery }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  storage: StorageInfo;
  exportBackup: () => void;
  previewImport: (file?: File) => void;
  importPreview: AppData | null;
  applyImport: (mode: "merge" | "replace") => Promise<void>;
  requestPersistence: () => Promise<void>;
  requestNotificationPermission: () => Promise<boolean>;
  onModeChange: (mode: Mode) => void;
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
}) {
  return <>
    <PageHeading autosave={false} title="تنظیمات و داده‌ها" description="برنامه کاری، پشتیبان‌گیری و فضای ذخیره‌سازی را مدیریت کن." />
    <section className={cn("grid grid-cols-[250px_minmax(0,1fr)] gap-[26px] max-[900px]:grid-cols-1")}>
      <SettingsNav />
      <div className={cn("grid grid-cols-2 items-start gap-4 max-[620px]:grid-cols-1")}>
        <span id="settings-general" className="col-span-full block scroll-mt-24" aria-hidden="true" /><div className="contents"><ProfileSettingsCard data={data} setData={setData} setToast={setToast} /><AppearanceSettingsCard data={data} setData={setData} setToast={setToast} /><SettingsBehaviorCard data={data} setData={setData} /></div>
        <span id="settings-data" className="col-span-full block scroll-mt-24" aria-hidden="true" /><div className="contents"><StorageCard storage={storage} requestPersistence={requestPersistence} /><RecoveryCard saveState={saveState} lastSavedAt={lastSavedAt} saveError={saveError} recoverySnapshot={recoverySnapshot} retrySave={retrySave} createRecovery={createRecovery} restoreRecovery={restoreRecovery} clearRecovery={clearRecovery} /><BackupCard exportBackup={exportBackup} /><RestoreCard previewImport={previewImport} importPreview={importPreview} applyImport={applyImport} /></div>
        <span id="settings-work" className="col-span-full block scroll-mt-24" aria-hidden="true" /><div className="contents"><WorkSettingsCard data={data} setData={setData} onModeChange={onModeChange} setToast={setToast} financialsHidden={financialsHidden} /><HolidayOverridesCard data={data} setData={setData} setToast={setToast} /><PayrollSettingsCard data={data} setData={setData} setToast={setToast} financialsHidden={financialsHidden} /><NotificationSettingsCard data={data} setData={setData} requestPermission={requestNotificationPermission} setToast={setToast} /></div>
        <span id="settings-about" className="col-span-full block scroll-mt-24" aria-hidden="true" /><div className="contents"><DangerZone setData={setData} setToast={setToast} /></div>
      </div>
    </section>
  </>;
}
