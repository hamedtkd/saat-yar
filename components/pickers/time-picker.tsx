"use client";

import { TimePickerDialog } from "./time-picker/time-picker-dialog";
import { TimePickerTrigger } from "./time-picker/time-picker-trigger";
import type { TimePickerProps } from "./time-picker/types";
import { useTimePicker } from "./time-picker/use-time-picker";

export function TimePicker({ value, onChange, suggestions = [] }: TimePickerProps) {
  const picker = useTimePicker(value, onChange);

  return (
    <div className="relative min-w-0">
      <TimePickerTrigger value={value} open={picker.open} onOpen={picker.openPicker} />
      {picker.open && (
        <TimePickerDialog
          hour={picker.hour}
          minute={picker.minute}
          draft={picker.draft}
          suggestions={suggestions}
          onHourChange={picker.changeHour}
          onMinuteChange={picker.changeMinute}
          onDraftChange={picker.setDraft}
          onClose={picker.closePicker}
          onConfirm={picker.confirm}
        />
      )}
    </div>
  );
}
