import { CalendarDays, Database, Info, UserRound } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import type { AppData, Mode, StorageInfo } from "@/lib/types";
import { BackupCard } from "./backup-card";
import { DangerZone } from "./danger-zone";
import { RestoreCard } from "./restore-card";
import { StorageCard } from "./storage-card";
import { WorkSettingsCard } from "./work-settings-card";
import { HolidayOverridesCard } from "./holiday-overrides-card";
import { PayrollSettingsCard } from "./payroll-settings-card";
import { cn } from "@/lib/cn";

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
    <section className={cn("grid grid-cols-[250px_minmax(0,1fr)] gap-[26px] max-[900px]:grid-cols-1")}>
      <aside className={cn("rounded-[15px] border border-[#dfe7e9] bg-white/95 shadow-[0_10px_35px_rgba(17,45,55,.055)] p-4", "self-start p-[10px] max-[900px]:flex max-[900px]:overflow-x-auto [&_button]:flex [&_button]:min-h-[52px] [&_button]:w-full [&_button]:items-center [&_button]:gap-[11px] [&_button]:rounded-[10px] [&_button]:border-0 [&_button]:bg-transparent [&_button]:px-[13px] [&_button]:font-semibold [&_button]:text-[#102a3a] [&_button.active]:bg-[#edf9f4] [&_button.active]:text-[#079b60] max-[900px]:[&_button]:min-w-max")}><button className="active"><Database /> داده و پشتیبان</button><button><UserRound /> عمومی</button><button><CalendarDays /> برنامه کاری</button><button><Info /> درباره برنامه</button></aside>
      <div className={cn("grid grid-cols-2 gap-3 max-[620px]:grid-cols-1")}><StorageCard storage={storage} requestPersistence={requestPersistence} /><BackupCard exportBackup={exportBackup} /><RestoreCard previewImport={previewImport} importPreview={importPreview} applyImport={applyImport} /><WorkSettingsCard data={data} setData={setData} onModeChange={onModeChange} setToast={setToast} /><HolidayOverridesCard data={data} setData={setData} setToast={setToast} /><PayrollSettingsCard data={data} setData={setData} setToast={setToast} /><DangerZone setData={setData} setToast={setToast} /></div>
    </section>
  </>;
}
