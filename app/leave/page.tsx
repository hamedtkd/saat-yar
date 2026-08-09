"use client";

import { LeavePage } from "@/components/pages/leave/leave-page";
import { useSaatyarContext } from "@/components/saatyar-shell";

export default function LeaveRoute() {
  const controller = useSaatyarContext();
  if (!controller.ready) return null;

  return (
    <LeavePage
      data={controller.data}
      setData={controller.setData}
      draft={controller.leaveDraft}
      setDraft={controller.setLeaveDraft}
      saveLeave={controller.saveLeave}
      used={controller.usedLeave}
      available={controller.leaveAvailable}
      summary={controller.leaveSummary}
    />
  );
}
