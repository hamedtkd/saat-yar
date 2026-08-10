import { useState } from "react";

import { translate, type MessageKey } from "@/lib/i18n/catalog";
import { formatLocaleDigits } from "@/lib/i18n/formatters";
import type { Locale } from "@/lib/i18n/locales";
import { normalizeTime, parseTimeInput, type TimeValidationErrorCode } from "./time-utils";

const TIME_ERROR_KEYS: Record<TimeValidationErrorCode, MessageKey> = {
  required: "picker.time.error.required",
  format: "picker.time.error.format",
  hour: "picker.time.error.hour",
  minute: "picker.time.error.minute",
};

export function useTimePicker(value: string, onChange: (value: string) => void, locale: Locale) {
  const display = (next: string) => formatLocaleDigits(locale, next);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => normalizeTime(value));
  const [inputValue, setInputValue] = useState(() => display(normalizeTime(value)));
  const [error, setError] = useState("");
  const [hour = "00", minute = "00"] = draft.split(":");

  const commitInput = () => {
    const parsed = parseTimeInput(inputValue);
    if (!parsed.valid) {
      setError(translate(locale, TIME_ERROR_KEYS[parsed.code]));
      return false;
    }
    setError("");
    setDraft(parsed.value);
    setInputValue(display(parsed.value));
    onChange(parsed.value);
    return true;
  };

  const openPicker = () => {
    const normalized = normalizeTime(value);
    setDraft(normalized);
    setInputValue(display(normalized));
    setError("");
    setOpen(true);
  };

  const closePicker = () => setOpen(false);
  const changeHour = (nextHour: string) => setDraft(`${nextHour}:${minute}`);
  const changeMinute = (nextMinute: string) => setDraft(`${hour}:${nextMinute}`);

  const confirm = () => {
    const normalized = normalizeTime(draft);
    onChange(normalized);
    setInputValue(display(normalized));
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
