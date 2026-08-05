import { ChevronDown } from "lucide-react";

import { BreaksEditor } from "./breaks-editor";
import { LunchEditor } from "./lunch-editor";
import type { TodayTimeStripProps } from "./types";
import { useTimeStripActions } from "./use-time-strip-actions";

export function AdvancedEditor(props: Pick<TodayTimeStripProps, "record" | "updateRecord">) {
  const actions = useTimeStripActions(props);
  return <details className="group border-t border-[#e5ecee] bg-[#fbfdfc]">
    <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs font-extrabold text-[#173747] transition-colors hover:bg-[#f4f9f7] [&::-webkit-details-marker]:hidden"><span>ویرایش دقیق ناهار و وقفه‌ها</span><ChevronDown className="size-4 transition-transform duration-200 group-open:rotate-180" /></summary>
    <div className="grid gap-4 border-t border-[#edf2f3] p-4"><LunchEditor record={props.record} updateRecord={props.updateRecord} updateLunch={actions.updateLunch} /><BreaksEditor record={props.record} addBreak={actions.addBreak} updateBreak={actions.updateBreak} removeBreak={actions.removeBreak} /></div>
  </details>;
}
