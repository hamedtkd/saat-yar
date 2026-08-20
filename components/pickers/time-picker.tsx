"use client";

import { useRef } from "react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { TimePickerDialog } from "./time-picker/time-picker-dialog";
import { TimePickerTrigger } from "./time-picker/time-picker-trigger";
import type { TimePickerProps } from "./time-picker/types";
import { useTimePicker } from "./time-picker/use-time-picker";

export function TimePicker(props: TimePickerProps) {
  return <TimePickerSession key={props.value} {...props} />;
}

function TimePickerSession({ value, onChange, suggestions = [], disabled = false }: TimePickerProps) {
  const { locale } = useLocaleUi();
  const anchorRef = useRef<HTMLDivElement>(null);
  const picker = useTimePicker(value, onChange, locale);

  return (
    <div ref={anchorRef} className="relative min-w-0">
      <TimePickerTrigger
        locale={locale}
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
          anchorRef={anchorRef}
          locale={locale}
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
