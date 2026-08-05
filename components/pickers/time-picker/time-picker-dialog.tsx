import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HOURS, MINUTES } from "./time-utils";
import { TimeSelect } from "./time-select";
import { TimeSuggestions } from "./time-suggestions";
import type { TimeSuggestion } from "./types";

export function TimePickerDialog({
  hour,
  minute,
  draft,
  suggestions,
  onHourChange,
  onMinuteChange,
  onDraftChange,
  onClose,
  onConfirm,
}: {
  hour: string;
  minute: string;
  draft: string;
  suggestions: TimeSuggestion[];
  onHourChange: (value: string) => void;
  onMinuteChange: (value: string) => void;
  onDraftChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <>
      <button type="button" aria-label="بستن انتخاب‌گر زمان" className="fixed inset-0 z-[700] border-0 bg-[#0a1f27]/15 backdrop-blur-[1px]" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label="انتخاب زمان" className="fixed top-1/2 left-1/2 z-[750] max-h-[calc(100dvh-24px)] w-[min(360px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[15px] border border-[#dfe7e9] bg-white p-3.5 shadow-[0_24px_80px_rgba(17,45,55,0.24)]">
        <div dir="ltr" className="mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center text-[10px] font-semibold text-[#6c7d89]">
          <span>ساعت</span><span aria-hidden="true" className="invisible">:</span><span>دقیقه</span>
        </div>
        <div dir="ltr" className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <TimeSelect label="انتخاب ساعت" value={hour} options={HOURS} onChange={onHourChange} />
          <strong aria-hidden="true" className="text-xl font-extrabold text-[#102a3a]">:</strong>
          <TimeSelect label="انتخاب دقیقه" value={minute} options={MINUTES} onChange={onMinuteChange} />
        </div>
        <TimeSuggestions suggestions={suggestions} draft={draft} onSelect={onDraftChange} />
        <Button type="button" className="mt-3 w-full" onClick={onConfirm}>
          <Check aria-hidden="true" className="size-4" />
          تأیید زمان
        </Button>
      </div>
    </>
  );
}
