import { useState } from "react";

import { faDigits } from "@/lib/format";
import { normalizeTime, parseTimeInput } from "./time-utils";

export function useTimePicker(value: string, onChange: (value: string) => void) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => normalizeTime(value));
  const [inputValue, setInputValue] = useState(() => faDigits(normalizeTime(value)));
  const [error, setError] = useState("");
  const [hour = "00", minute = "00"] = draft.split(":");

  const commitInput = () => {
    const parsed = parseTimeInput(inputValue);
    if (!parsed.valid) {
      setError(parsed.error);
      return false;
    }
    setError("");
    setDraft(parsed.value);
    setInputValue(faDigits(parsed.value));
    onChange(parsed.value);
    return true;
  };

  const openPicker = () => {
    const normalized = normalizeTime(value);
    setDraft(normalized);
    setInputValue(faDigits(normalized));
    setError("");
    setOpen(true);
  };

  const closePicker = () => setOpen(false);
  const changeHour = (nextHour: string) => setDraft(`${nextHour}:${minute}`);
  const changeMinute = (nextMinute: string) => setDraft(`${hour}:${nextMinute}`);

  const confirm = () => {
    const normalized = normalizeTime(draft);
    onChange(normalized);
    setInputValue(faDigits(normalized));
    setError("");
    setOpen(false);
  };

  return {
    open,
    draft,
    hour,
    minute,
    inputValue,
    error,
    setDraft,
    setInputValue,
    setError,
    commitInput,
    openPicker,
    closePicker,
    changeHour,
    changeMinute,
    confirm,
  };
}
