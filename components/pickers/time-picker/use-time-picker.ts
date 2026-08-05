import { useState } from "react";

import { normalizeTime } from "./time-utils";

export function useTimePicker(value: string, onChange: (value: string) => void) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => normalizeTime(value));
  const [hour = "00", minute = "00"] = draft.split(":");

  const openPicker = () => {
    setDraft(normalizeTime(value));
    setOpen(true);
  };

  const closePicker = () => setOpen(false);
  const changeHour = (nextHour: string) => setDraft(`${nextHour}:${minute}`);
  const changeMinute = (nextMinute: string) => setDraft(`${hour}:${nextMinute}`);

  const confirm = () => {
    onChange(normalizeTime(draft));
    setOpen(false);
  };

  return {
    open,
    draft,
    hour,
    minute,
    setDraft,
    openPicker,
    closePicker,
    changeHour,
    changeMinute,
    confirm,
  };
}
