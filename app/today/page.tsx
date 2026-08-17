"use client";

import { useRouter } from "next/navigation";
import { TodayPage } from "@/components/pages/today/today-page";
import { useSaatyarContext } from "@/components/saatyar-shell";
import { getTabHref } from "@/lib/navigation";

export default function TodayRoute() {
  const controller = useSaatyarContext();
  const router = useRouter();

  if (!controller.ready) return null;

  return (
    <TodayPage
      data={controller.data}
      setData={controller.setData}
      setToast={controller.setToast}
      record={controller.record}
      selectedDate={controller.selectedDate}
      setSelectedDate={controller.setSelectedDate}
      todayCalc={controller.todayCalc}
      dailyTarget={controller.dailyTarget}
      suggestedExit={controller.suggestedExit}
      activeEntry={controller.activeEntry}
      activeBreak={controller.activeBreak}
      activeActivitySegment={controller.activeActivitySegment}
      lunchRunning={controller.lunchRunning}
      timerDraft={controller.timerDraft}
      setTimerDraft={controller.setTimerDraft}
      startWork={controller.startWork}
      resumeAutoClosedWork={controller.resumeAutoClosedWork}
      pendingPreviousRecord={controller.pendingPreviousRecord}
      closePreviousAndStart={controller.closePreviousAndStart}
      reviewPreviousRecord={controller.reviewPreviousRecord}
      dismissPreviousRecord={controller.dismissPreviousRecord}
      finishWork={controller.finishWork}
      updateRecord={controller.updateRecord}
      resetRecord={controller.resetRecord}
      resetUndoDate={controller.resetUndoDate}
      undoResetRecord={controller.undoResetRecord}
      dismissResetUndo={controller.dismissResetUndo}
      startLunch={controller.startLunch}
      finishLunch={controller.finishLunch}
      startBreak={controller.startBreak}
      finishBreak={controller.finishBreak}
      startActivitySegment={controller.startActivitySegment}
      stopActivitySegment={controller.stopActivitySegment}
      toggleProjectTimer={controller.toggleProjectTimer}
      createClient={controller.createClient}
      createProject={controller.createProject}
      editingEntry={controller.editingEntry}
      setEditingEntry={controller.setEditingEntry}
      setTab={(tab) => router.push(getTabHref(tab))}
      financialsHidden={controller.financialsHidden}
    />
  );
}
