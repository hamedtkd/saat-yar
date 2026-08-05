import { TimePicker } from "@/components/pickers";

import type { TodayTimeStripProps } from "./types";

export function TimeInputs({ record, data, suggestedExit, updateRecord }: Pick<TodayTimeStripProps, "record" | "data" | "suggestedExit" | "updateRecord">) {
  return <>
    <label className="grid min-w-0 gap-2">
      <span className="text-xs font-extrabold text-[#173747]">ورود</span>
      <TimePicker value={record.start} onChange={(start) => updateRecord({ start, startedAt: undefined })}
        suggestions={[{ label: "شروع معمول", value: data.settings.defaultStart }]} />
    </label>
    <label className="grid min-w-0 gap-2">
      <span className="text-xs font-extrabold text-[#173747]">خروج</span>
      <TimePicker value={record.end} onChange={(end) => updateRecord({ end, endedAt: undefined })}
        suggestions={[{ label: "پیشنهادی", value: suggestedExit }, { label: "پایان معمول", value: data.settings.defaultEnd }]} />
    </label>
  </>;
}
