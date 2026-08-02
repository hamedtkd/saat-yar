"use client";

import { CheckCircle2, Clock3 } from "lucide-react";
import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { Onboarding } from "@/components/layout/onboarding";
import { ClientsPage } from "@/components/pages/clients/clients-page";
import { LeavePage } from "@/components/pages/leave/leave-page";
import { MonthPage } from "@/components/pages/month/month-page";
import { ProjectsPage } from "@/components/pages/projects/projects-page";
import { ReportsPage } from "@/components/pages/reports/reports-page";
import { SettingsPage } from "@/components/pages/settings/settings-page";
import { TodayPage } from "@/components/pages/today/today-page";
import { useSaatyarController } from "@/hooks/use-saatyar-controller";
import { cn } from "@/lib/cn";
export function SaatyarApp() {
  const controller = useSaatyarController();
  if (!controller.ready) return <main className={cn("grid min-h-screen place-content-center gap-3 font-extrabold text-[#079b60] [&_svg]:mx-auto [&_svg]:h-8 [&_svg]:w-8")}><Clock3 /> در حال آماده‌سازی ساعت‌یار…</main>;
  const { data, setData, tab, setTab } = controller;

  return (
    <main className={cn("min-h-screen w-full p-3 max-[900px]:p-[7px] max-[900px]:pb-24 [&_label]:grid [&_label]:gap-[7px] [&_label]:text-[11px] [&_label]:font-semibold [&_label]:text-[#314b58] [&_button]:cursor-pointer [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:stroke-[1.85]")} dir="rtl">
      {controller.toast && <div className={cn("fixed left-1/2 top-[22px] z-[1000] flex -translate-x-1/2 items-center gap-2 rounded-xl border border-[#bce2d3] bg-[#effaf5] px-[17px] py-[11px] text-xs font-bold text-[#087f50] shadow-[0_18px_50px_rgba(17,45,55,.16)]")} role="status"><CheckCircle2 />{controller.toast}</div>}
      {!data.settings.onboarded && <Onboarding data={data} setData={setData} step={controller.onboardingStep} setStep={controller.setOnboardingStep} />}
      <AppHeader name={data.settings.name} mode={data.settings.mode} tab={tab} onTabChange={setTab} onModeChange={controller.changeMode} onExport={controller.exportBackup} />
      <div className={cn("mx-auto max-w-[1510px] px-[26px] pb-[18px] pt-[30px] max-[900px]:px-[10px] max-[900px]:py-[22px]")}>
        {tab === "today" && <TodayPage data={data} setData={setData} record={controller.record} selectedDate={controller.selectedDate} setSelectedDate={controller.setSelectedDate} todayCalc={controller.todayCalc} dailyTarget={controller.dailyTarget} suggestedExit={controller.suggestedExit} activeEntry={controller.activeEntry} activeBreak={controller.activeBreak} lunchRunning={controller.lunchRunning} timerDraft={controller.timerDraft} setTimerDraft={controller.setTimerDraft} startWork={controller.startWork} finishWork={controller.finishWork} updateRecord={controller.updateRecord} startLunch={controller.startLunch} finishLunch={controller.finishLunch} startBreak={controller.startBreak} finishBreak={controller.finishBreak} toggleProjectTimer={controller.toggleProjectTimer} editingEntry={controller.editingEntry} setEditingEntry={controller.setEditingEntry} setTab={setTab} />}
        {tab === "clients" && <ClientsPage data={data} setData={setData} showForm={controller.showClientForm} setShowForm={controller.setShowClientForm} draft={controller.clientDraft} setDraft={controller.setClientDraft} addClient={controller.addClient} setTab={setTab} />}
        {tab === "month" && <MonthPage data={data} selectedDate={controller.selectedDate} setSelectedDate={controller.setSelectedDate} monthRecords={controller.monthRecords} monthStats={controller.monthStats} dailyTarget={controller.dailyTarget} />}
        {tab === "projects" && <ProjectsPage data={data} setData={setData} selectedProject={controller.selectedProject} setSelectedProjectId={controller.setSelectedProjectId} showForm={controller.showProjectForm} setShowForm={controller.setShowProjectForm} draft={controller.projectDraft} setDraft={controller.setProjectDraft} addProject={controller.addProject} activeEntry={controller.activeEntry} toggleProjectTimer={controller.toggleProjectTimer} />}
        {tab === "reports" && <ReportsPage data={data} monthRecords={controller.monthRecords} monthStats={controller.monthStats} filters={controller.reportFilter} setFilters={controller.setReportFilter} entries={controller.filteredEntries} reportBillable={controller.reportBillable} reportIncome={controller.reportIncome} exportReport={controller.exportReport} />}
        {tab === "leave" && <LeavePage data={data} setData={setData} draft={controller.leaveDraft} setDraft={controller.setLeaveDraft} saveLeave={controller.saveLeave} used={controller.usedLeave} available={controller.leaveAvailable} />}
        {tab === "settings" && <SettingsPage data={data} setData={setData} storage={controller.storageInfo} exportBackup={controller.exportBackup} previewImport={controller.previewImport} importPreview={controller.importPreview} applyImport={controller.applyImport} requestPersistence={controller.requestPersistence} onModeChange={controller.changeMode} setToast={controller.setToast} />}
      </div>
      <AppFooter online={controller.online} />
    </main>
  );
}
