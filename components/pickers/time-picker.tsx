"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { faDigits } from "@/lib/format";

type TimeSuggestion = {
  label: string;
  value: string;
};

type TimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  suggestions?: TimeSuggestion[];
};

const DEFAULT_TIME = "00:00";

function normalizeTime(value: string): string {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    return DEFAULT_TIME;
  }

  const [hour, minute] = value.split(":").map(Number);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return DEFAULT_TIME;
  }

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function TimePicker({
  value,
  onChange,
  suggestions = [],
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => normalizeTime(value));

  useEffect(() => {
    setDraft(normalizeTime(value));
  }, [value]);

  const [hour = "00", minute = "00"] = draft.split(":");

  const hours = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0")),
    [],
  );

  const minutes = useMemo(
    () =>
      Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0")),
    [],
  );

  const handleOpen = () => {
    setDraft(normalizeTime(value));
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleHourChange = (nextHour: string) => {
    setDraft(`${nextHour}:${minute}`);
  };

  const handleMinuteChange = (nextMinute: string) => {
    setDraft(`${hour}:${nextMinute}`);
  };

  const handleConfirm = () => {
    onChange(normalizeTime(draft));
    setOpen(false);
  };

  return (
    <div className="relative min-w-0">
      <Button
        type="button"
        variant="outline"
        className="grid h-11 w-full grid-cols-[auto_1fr_auto] items-center gap-2.5 text-right"
        onClick={handleOpen}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Clock3 aria-hidden="true" className="size-5 text-[#079b60]" />

        <strong
          dir="ltr"
          className="justify-self-start font-extrabold tabular-nums"
        >
          {value ? faDigits(normalizeTime(value)) : "--:--"}
        </strong>

        <ChevronDown aria-hidden="true" className="size-4 text-[#6c7d89]" />
      </Button>

      {open && (
        <>
          <button
            type="button"
            aria-label="بستن انتخاب‌گر زمان"
            className="fixed inset-0 z-[700] border-0 bg-[#0a1f27]/15 backdrop-blur-[1px]"
            onClick={handleClose}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="انتخاب زمان"
            className="fixed top-1/2 left-1/2 z-[750] max-h-[calc(100dvh-24px)] w-[min(360px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[15px] border border-[#dfe7e9] bg-white p-3.5 shadow-[0_24px_80px_rgba(17,45,55,0.24)]"
          >
            <div
              dir="ltr"
              className="mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center text-[10px] font-semibold text-[#6c7d89]"
            >
              <span>ساعت</span>
              <span aria-hidden="true" className="invisible">
                :
              </span>
              <span>دقیقه</span>
            </div>

            <div
              dir="ltr"
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-2"
            >
              <Select value={hour} onValueChange={handleHourChange}>
                <SelectTrigger
                  aria-label="انتخاب ساعت"
                  className="h-11 justify-center text-xl font-extrabold tabular-nums"
                >
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {hours.map((item) => (
                    <SelectItem
                      key={item}
                      value={item}
                      className="tabular-nums"
                    >
                      {faDigits(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <strong
                aria-hidden="true"
                className="text-xl font-extrabold text-[#102a3a]"
              >
                :
              </strong>

              <Select value={minute} onValueChange={handleMinuteChange}>
                <SelectTrigger
                  aria-label="انتخاب دقیقه"
                  className="h-11 justify-center text-xl font-extrabold tabular-nums"
                >
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {minutes.map((item) => (
                    <SelectItem
                      key={item}
                      value={item}
                      className="tabular-nums"
                    >
                      {faDigits(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {suggestions.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {suggestions.map((item) => {
                  const normalizedValue = normalizeTime(item.value);
                  const isSelected = normalizedValue === draft;

                  return (
                    <Button
                      type="button"
                      key={`${item.label}-${item.value}`}
                      variant="outline"
                      className="justify-between gap-2"
                      onClick={() => setDraft(normalizedValue)}
                    >
                      <span>{item.label}</span>

                      <b dir="ltr" className="tabular-nums">
                        {faDigits(normalizedValue)}
                      </b>

                      {isSelected && (
                        <Check
                          aria-hidden="true"
                          className="size-4 text-[#079b60]"
                        />
                      )}
                    </Button>
                  );
                })}
              </div>
            )}

            <Button
              type="button"
              className="mt-3 w-full"
              onClick={handleConfirm}
            >
              <Check aria-hidden="true" className="size-4" />
              تأیید زمان
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
