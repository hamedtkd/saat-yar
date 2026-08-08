import { SurfaceCard } from "@/components/common/surface-card";
import { AdvancedEditor } from "./time-strip/advanced-editor";
import { QuickControls } from "./time-strip/quick-controls";
import { TimeInputs } from "./time-strip/time-inputs";
import type { TodayTimeStripViewProps } from "./time-strip/types";

export function TodayTimeStrip(props: TodayTimeStripViewProps) {
  return <SurfaceCard className="dashboard-card mb-4 overflow-hidden p-0 shadow-[0_5px_16px_rgba(0,0,0,.03)]">
    <div className="grid grid-cols-1 gap-2.5 p-3 md:grid-cols-2 xl:grid-cols-4">
      <TimeInputs record={props.record} data={props.data} suggestedExit={props.suggestedExit} updateRecord={props.updateRecord} startWork={props.startWork} finishWork={props.finishWork} scheduledDayOff={props.scheduledDayOff} />
      {props.showQuickActions !== false && <QuickControls record={props.record} lunchRunning={props.lunchRunning} startLunch={props.startLunch} finishLunch={props.finishLunch} activeBreak={props.activeBreak} todayCalc={props.todayCalc} startBreak={props.startBreak} finishBreak={props.finishBreak} />}
    </div>
    <AdvancedEditor record={props.record} updateRecord={props.updateRecord} />
  </SurfaceCard>;
}
