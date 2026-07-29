import { CalendarDays, Database, Info, UserRound } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { tw } from "@/lib/tw";
import type { AppData, Mode, StorageInfo } from "@/lib/types";
import { BackupCard } from "./backup-card";
import { DangerZone } from "./danger-zone";
import { RestoreCard } from "./restore-card";
import { StorageCard } from "./storage-card";
import { WorkSettingsCard } from "./work-settings-card";

export function SettingsPage({ data, setData, storage, exportBackup, previewImport, importPreview, applyImport, requestPersistence, onModeChange, setToast }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  storage: StorageInfo;
  exportBackup: () => void;
  previewImport: (file?: File) => void;
  importPreview: AppData | null;
  applyImport: (mode: "merge" | "replace") => Promise<void>;
  requestPersistence: () => Promise<void>;
  onModeChange: (mode: Mode) => void;
  setToast: (message: string) => void;
}) {
  return <>
    <PageHeading autosave={false} title="تنظیمات و داده‌ها" description="برنامه کاری، پشتیبان‌گیری و فضای ذخیره‌سازی را مدیریت کن." />
    <section className={tw("settings-layout")}>
      <aside className={tw("panel", "settings-menu")}><button className="active"><Database /> داده و پشتیبان</button><button><UserRound /> عمومی</button><button><CalendarDays /> برنامه کاری</button><button><Info /> درباره برنامه</button></aside>
      <div className={tw("settings-content")}><StorageCard storage={storage} requestPersistence={requestPersistence} /><BackupCard exportBackup={exportBackup} /><RestoreCard previewImport={previewImport} importPreview={importPreview} applyImport={applyImport} /><WorkSettingsCard data={data} setData={setData} onModeChange={onModeChange} setToast={setToast} /><DangerZone setData={setData} setToast={setToast} /></div>
    </section>
  </>;
}
