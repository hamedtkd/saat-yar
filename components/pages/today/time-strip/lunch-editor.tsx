import { MinuteDurationField } from "@/components/common/minute-duration-field";
import { TimePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import type { WorkRecord } from "@/lib/types";

import type { TodayTimeStripProps } from "./types";

export function LunchEditor({ record, updateRecord, updateLunch }: Pick<TodayTimeStripProps, "record" | "updateRecord"> & { updateLunch: (patch: Partial<WorkRecord>) => void }) {
  return <section className="rounded-2xl border border-[#dfe9e6] bg-[#f8fbfa] p-4">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div><strong className="text-sm font-extrabold text-[#173747]">ناهار</strong><p className="mt-1 text-[10px] leading-5 text-[#6c7d89]">زمان شروع، پایان و وضعیت باحقوق بودن ناهار را تنظیم کنید.</p></div>
      <label className="flex! cursor-pointer items-center gap-2 rounded-xl border border-[#dce8e3] bg-white px-3 py-2 text-[11px] font-semibold text-[#526b75]"><input type="checkbox" checked={Boolean(record.lunchPaid)} onChange={(event) => updateRecord({ lunchPaid: event.target.checked })} className="size-4 accent-[#079b60]" /><span>با حقوق</span></label>
    </div>
    <div className="grid gap-3 md:grid-cols-3">
      <label className="grid min-w-0 gap-2"><span className="text-[11px] font-bold text-[#526b75]">شروع</span><TimePicker value={record.lunchStart ?? ""} onChange={(lunchStart) => updateLunch({ lunchStart, lunchStartedAt: undefined })} /></label>
      <label className="grid min-w-0 gap-2"><span className="text-[11px] font-bold text-[#526b75]">پایان</span><TimePicker value={record.lunchEnd ?? ""} onChange={(lunchEnd) => updateLunch({ lunchEnd, lunchEndedAt: undefined })} /></label>
      <label className="grid min-w-0 gap-2"><span className="text-[11px] font-bold text-[#526b75]">مدت</span><MinuteDurationField value={record.lunchMinutes} onValueChange={(lunchMinutes) => updateLunch({ lunchMinutes })} max={360} /></label>
    </div>
    {(record.lunchStart || record.lunchEnd) && <Button type="button" className="mt-3 rounded-xl" variant="ghost" size="sm" onClick={() => updateRecord({ lunchStart: undefined, lunchEnd: undefined, lunchStartedAt: undefined, lunchEndedAt: undefined })}>پاک‌کردن ساعت ناهار</Button>}
  </section>;
}
