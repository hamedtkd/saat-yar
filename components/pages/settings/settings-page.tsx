"use client";

import { Bell, CalendarClock, CalendarSync, Database, Palette, ShieldCheck, SlidersHorizontal, Smartphone, WalletCards } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { useLocale } from "@/components/i18n/locale-provider";
import type { SaveState } from "@/hooks/use-persisted-app-data";
import type { MultiTabSyncStatus } from "@/lib/multi-tab-sync-status";
import type { RecoverySnapshot } from "@/lib/recovery";
import type { AppData, StorageInfo } from "@/lib/types";
import { cn } from "@/lib/cn";
import { AnalyticsPrivacyCard } from "./analytics-privacy-card";
import { AppearanceSettingsCard } from "./appearance/appearance-settings-card";
import { BackupCard } from "./backup-card";
import { DangerZone } from "./danger-zone";
import { DataHealthCard } from "./data-health-card";
import { DeviceTransferCard } from "./device-transfer-card";
import { GoogleCalendarCard } from "./google-calendar-card";
import { HolidayOverridesCard } from "./holiday-overrides-card";
import { LanguageSettingsCard } from "./language-settings-card";
import { NotificationSettingsCard } from "./notification-settings-card";
import { OnboardingReentryCard } from "./onboarding-reentry-card";
import { PayrollPolicyCard } from "./payroll-policy-card";
import { PayrollSettingsCard } from "./payroll-settings-card";
import { ProfileSettingsCard } from "./profile-settings-card";
import { RecordRecycleBinCard } from "./record-recycle-bin-card";
import { RecoveryCard } from "./recovery-card";
import { RestoreCard } from "./restore-card";
import { SettingsBehaviorCard } from "./settings-behavior-card";
import { SettingsNav } from "./settings-nav";
import { SettingsOverview } from "./settings-overview";
import type { SettingsRouteId } from "./settings-route-model";
import { getSettingsRouteDefinition } from "./settings-route-model";
import { SettingsSearch } from "./settings-search";
import { SettingsSection } from "./settings-section";
import { StorageCard } from "./storage-card";
import { WorkSettingsCard } from "./work-settings-card";

type Props = {
  route: SettingsRouteId;
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
};

export function SettingsPage(props: Props) {
  const { t } = useLocale();
  const routeDefinition = getSettingsRouteDefinition(props.route);
  const pageTitle = routeDefinition ? t(routeDefinition.labelKey) : t("settings.title");
  const pageDescription = routeDefinition ? t(routeDefinition.descriptionKey) : t("settings.description");
  return <>
    <PageHeading autosave={false} title={pageTitle} description={pageDescription} />
    <SettingsSearch />
    <section className={cn("grid grid-cols-[250px_minmax(0,1fr)] gap-5 max-[900px]:grid-cols-1 max-[900px]:gap-3")}>
      <SettingsNav />
      <div className="grid min-w-0 gap-5">
        {props.route === "overview" && <SettingsOverview />}
        {props.route === "profile" && <><span id="settings-general" className="block scroll-mt-24" aria-hidden="true" /><SettingsSection icon={<SlidersHorizontal />} eyebrow={t("settings.general.eyebrow")} title={t("settings.general.title")} description={t("settings.general.description")}><OnboardingReentryCard startOnboardingReentry={props.startOnboardingReentry} /><ProfileSettingsCard data={props.data} setData={props.setData} setToast={props.setToast} /><LanguageSettingsCard /><SettingsBehaviorCard data={props.data} setData={props.setData} setToast={props.setToast} /></SettingsSection></>}
        {props.route === "appearance" && <SettingsSection icon={<Palette />} eyebrow={t("settings.general.eyebrow")} title={t("settings.nav.appearance")} description={t("settings.general.description")}><AppearanceSettingsCard data={props.data} setData={props.setData} setToast={props.setToast} /></SettingsSection>}
        {props.route === "work" && <><span id="settings-work" className="block scroll-mt-24" aria-hidden="true" /><SettingsSection icon={<CalendarClock />} eyebrow={t("settings.work.eyebrow")} title={t("settings.work.title")} description={t("settings.work.description")}><WorkSettingsCard data={props.data} setData={props.setData} setToast={props.setToast} /><HolidayOverridesCard data={props.data} setData={props.setData} setToast={props.setToast} /></SettingsSection></>}
        {props.route === "payroll" && <SettingsSection icon={<WalletCards />} eyebrow={t("settings.work.eyebrow")} title={t("settings.nav.payroll")} description={t("settings.work.description")}><PayrollPolicyCard data={props.data} setData={props.setData} setToast={props.setToast} financialsHidden={props.financialsHidden} /><PayrollSettingsCard data={props.data} setData={props.setData} setToast={props.setToast} financialsHidden={props.financialsHidden} /></SettingsSection>}
        {props.route === "notifications" && <SettingsSection icon={<Bell />} eyebrow={t("settings.work.eyebrow")} title={t("settings.nav.notifications")} description={t("settings.work.description")}><NotificationSettingsCard data={props.data} setData={props.setData} requestPermission={props.requestNotificationPermission} setToast={props.setToast} /></SettingsSection>}
        {props.route === "integrations" && <><span id="settings-integrations" className="block scroll-mt-24" aria-hidden="true" /><SettingsSection icon={<CalendarSync />} eyebrow={t("settings.integrations.eyebrow")} title={t("settings.integrations.title")} description={t("settings.integrations.description")}><GoogleCalendarCard /></SettingsSection></>}
        {props.route === "data" && <><span id="settings-data" className="block scroll-mt-24" aria-hidden="true" /><SettingsSection icon={<Database />} eyebrow={t("settings.data.eyebrow")} title={t("settings.data.title")} description={t("settings.data.description")}><RecordRecycleBinCard data={props.data} setData={props.setData} setToast={props.setToast} /><StorageCard storage={props.storage} requestPersistence={props.requestPersistence} /><RecoveryCard saveState={props.saveState} lastSavedAt={props.lastSavedAt} saveError={props.saveError} recoverySnapshot={props.recoverySnapshot} retrySave={props.retrySave} createRecovery={props.createRecovery} restoreRecovery={props.restoreRecovery} clearRecovery={props.clearRecovery} /><BackupCard exportBackup={props.exportBackup} /><RestoreCard previewImport={props.previewImport} importPreview={props.importPreview} applyImport={props.applyImport} /></SettingsSection></>}
        {props.route === "sync" && <SettingsSection icon={<Smartphone />} eyebrow={t("settings.data.eyebrow")} title={t("settings.nav.transfer")} description={t("settings.data.description")}><DataHealthCard records={props.data.records} syncStatus={props.multiTabSyncStatus} clearSyncHistory={props.clearMultiTabSyncHistory} /><DeviceTransferCard data={props.data} setData={props.setData} setToast={props.setToast} /></SettingsSection>}
        {props.route === "privacy" && <><span id="settings-about" className="block scroll-mt-24" aria-hidden="true" /><SettingsSection icon={<ShieldCheck />} eyebrow={t("settings.safety.eyebrow")} title={t("settings.safety.title")} description={t("settings.safety.description")}><AnalyticsPrivacyCard /><DangerZone setData={props.setData} setToast={props.setToast} /></SettingsSection></>}
      </div>
    </section>
  </>;
}
