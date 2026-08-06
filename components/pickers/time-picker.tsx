"use client";

import { TimePickerDialog } from "./time-picker/time-picker-dialog";
import { TimePickerTrigger } from "./time-picker/time-picker-trigger";
import type { TimePickerProps } from "./time-picker/types";
import { useTimePicker } from "./time-picker/use-time-picker";

export function TimePicker({ value, onChange, suggestions = [], disabled = false }: TimePickerProps) {
  const picker = useTimePicker(value, onChange);

  return (
    <div className="relative min-w-0">
      <TimePickerTrigger
        inputValue={picker.inputValue}
        error={picker.error}
        open={picker.open}
        disabled={disabled}
        onInputChange={(nextValue) => { picker.setInputValue(nextValue); picker.setError(""); }}
        onCommit={picker.commitInput}
        onOpen={picker.openPicker}
      />
      {!disabled && picker.open && (
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
