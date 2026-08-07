"use client";

import { useState, type InputHTMLAttributes, type KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { formatEditableNumber, parseLocalizedNumber } from "@/lib/localized-number";

type NumberFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange" | "min" | "max" | "step"> & {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number | string;
};

function clamp(value: number, min?: number, max?: number) {
  const lower = min == null ? value : Math.max(min, value);
  return max == null ? lower : Math.min(max, lower);
}

export function NumberField({ value, onValueChange, min = 0, max, step = 1, onFocus, onBlur, onKeyDown, ...props }: NumberFieldProps) {
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const numericStep = Number(step) || 1;
  const displayValue = editing ? draft : formatEditableNumber(Number.isFinite(value) ? value : min);

  const commit = (rawValue: string) => {
    const parsed = parseLocalizedNumber(rawValue);
    if (parsed == null) return;
    onValueChange(clamp(parsed, min, max));
  };

  const handleArrowKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    const direction = event.key === "ArrowUp" ? 1 : -1;
    const nextValue = clamp((Number.isFinite(value) ? value : min) + direction * numericStep, min, max);
    setDraft(formatEditableNumber(nextValue));
    onValueChange(nextValue);
  };

  return (
    <Input
      {...props}
      type="text"
      inputMode={numericStep % 1 === 0 ? "numeric" : "decimal"}
      role="spinbutton"
      dir="ltr"
      value={displayValue}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Number.isFinite(value) ? value : min}
      onFocus={(event) => {
        setEditing(true);
        setDraft(formatEditableNumber(Number.isFinite(value) ? value : min));
        onFocus?.(event);
      }}
      onChange={(event) => {
        setDraft(event.target.value);
        commit(event.target.value);
      }}
      onBlur={(event) => {
        commit(event.target.value);
        setEditing(false);
        onBlur?.(event);
      }}
      onKeyDown={(event) => {
        handleArrowKey(event);
        onKeyDown?.(event);
      }}
      className={`${props.className ?? ""} tabular-nums`}
    />
  );
}
