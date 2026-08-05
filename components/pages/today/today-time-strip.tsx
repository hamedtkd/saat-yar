import { SurfaceCard } from "@/components/common/surface-card";

import { AdvancedEditor } from "./time-strip/advanced-editor";
import { QuickControls } from "./time-strip/quick-controls";
import { TimeInputs } from "./time-strip/time-inputs";
import type { TodayTimeStripProps } from "./time-strip/types";

export function TodayTimeStrip(props: TodayTimeStripProps) {
  return <SurfaceCard className="mb-5 overflow-hidden p-0">
    <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 lg:grid-cols-[1.1fr_1.1fr_1fr_1fr]">
      <TimeInputs record={props.record} data={props.data} suggestedExit={props.suggestedExit} updateRecord={props.updateRecord} />
      <QuickControls record={props.record} lunchRunning={props.lunchRunning} startLunch={props.startLunch} finishLunch={props.finishLunch} activeBreak={props.activeBreak} todayCalc={props.todayCalc} startBreak={props.startBreak} finishBreak={props.finishBreak} />
    </div>
    <AdvancedEditor record={props.record} updateRecord={props.updateRecord} />
  </SurfaceCard>;
}
