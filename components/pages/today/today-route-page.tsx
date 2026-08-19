"use client";

import { useRouter } from "next/navigation";
import { useSaatyarContext } from "@/components/saatyar-shell";
import { getTabHref } from "@/lib/navigation";
import type { Mode } from "@/lib/types";
import { EmployeeTodayPage, FreelancerTodayPage, HybridTodayPage } from "./mode-today-page";
import type { TodayPageProps } from "./types";

export function TodayRoutePage({ expectedMode }: { expectedMode: Mode }) {
  const controller = useSaatyarContext();
  const router = useRouter();

  if (!controller.ready || controller.data.settings.mode !== expectedMode) return null;

  const props: TodayPageProps = {
    data: controller.data,
    setData: controller.setData,
    setToast: controller.setToast,
    record: controller.record,
    selectedDate: controller.selectedDate,
    setSelectedDate: controller.setSelectedDate,
    todayCalc: controller.todayCalc,
    dailyTarget: controller.dailyTarget,
    suggestedExit: controller.suggestedExit,
    activeEntry: controller.activeEntry,
    projectTimerSession: controller.projectTimerSession,
    activeBreak: controller.activeBreak,
    activeActivitySegment: controller.activeActivitySegment,
    lunchRunning: controller.lunchRunning,
    timerDraft: controller.timerDraft,
    setTimerDraft: controller.setTimerDraft,
    startWork: controller.startWork,
    resumeAutoClosedWork: controller.resumeAutoClosedWork,
    pendingPreviousRecord: controller.pendingPreviousRecord,
    closePreviousAndStart: controller.closePreviousAndStart,
    reviewPreviousRecord: controller.reviewPreviousRecord,
    dismissPreviousRecord: controller.dismissPreviousRecord,
    finishWork: controller.finishWork,
    updateRecord: controller.updateRecord,
    resetRecord: controller.resetRecord,
    resetUndoDate: controller.resetUndoDate,
    undoResetRecord: controller.undoResetRecord,
    dismissResetUndo: controller.dismissResetUndo,
    startLunch: controller.startLunch,
    finishLunch: controller.finishLunch,
    startBreak: controller.startBreak,
    finishBreak: controller.finishBreak,
    startActivitySegment: controller.startActivitySegment,
    stopActivitySegment: controller.stopActivitySegment,
    toggleProjectTimer: controller.toggleProjectTimer,
    startProjectTimer: controller.startProjectTimer,
    pauseProjectTimer: controller.pauseProjectTimer,
    resumeProjectTimer: controller.resumeProjectTimer,
    finishProjectTimer: controller.finishProjectTimer,
    updateProjectTimerDetails: controller.updateProjectTimerDetails,
    createClient: controller.createClient,
    createProject: controller.createProject,
    editingEntry: controller.editingEntry,
    setEditingEntry: controller.setEditingEntry,
    setTab: (tab) => router.push(getTabHref(tab, expectedMode)),
    financialsHidden: controller.financialsHidden,
  };

  if (expectedMode === "freelancer") return <FreelancerTodayPage {...props} />;
  if (expectedMode === "employee") return <EmployeeTodayPage {...props} />;
  return <HybridTodayPage {...props} />;
}
