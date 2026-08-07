"use client";

import { useMemo, useState } from "react";
import { NumberField } from "@/components/common/number-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fa } from "@/lib/format";
import { cn } from "@/lib/cn";

const DEFAULT_PRESETS = [20, 30, 45, 60];
const CUSTOM_VALUE = "custom";

type MinuteDurationFieldProps = {
  value: number;
  onValueChange: (value: number) => void;
  presets?: number[];
  min?: number;
  max?: number;
  className?: string;
  disabled?: boolean;
};

export function MinuteDurationField({
  value,
  onValueChange,
  presets = DEFAULT_PRESETS,
  min = 0,
  max = 240,
  className,
  disabled = false,
}: MinuteDurationFieldProps) {
  const options = useMemo(
    () =>
      [...new Set(presets)]
        .filter((item) => Number.isFinite(item) && item >= min && item <= max)
        .sort((a, b) => a - b),
    [max, min, presets],
  );
  const [customMode, setCustomMode] = useState(!options.includes(value));
  const customModeActive = customMode || !options.includes(value);
  const selectValue = customModeActive ? CUSTOM_VALUE : String(value);

  function updateCustomValue(rawValue: string) {
    const parsed = Number(rawValue);
    const nextValue = Number.isFinite(parsed)
      ? Math.min(max, Math.max(min, Math.round(parsed)))
      : min;
    onValueChange(nextValue);
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Select
        disabled={disabled}
        value={selectValue}
        onValueChange={(nextValue) => {
          if (nextValue === CUSTOM_VALUE) {
            setCustomMode(true);
            return;
          }

          setCustomMode(false);
          onValueChange(Number(nextValue));
        }}
      >
        <SelectTrigger aria-label="مدت زمان به دقیقه">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem value={String(option)} key={option}>
              {fa.format(option)} دقیقه
            </SelectItem>
          ))}
          <SelectItem value={CUSTOM_VALUE}>مقدار دلخواه…</SelectItem>
        </SelectContent>
      </Select>

      {customMode && (
        <div className="relative">
          <NumberField
            disabled={disabled}
            min={min}
            max={max}
            step={1}
            value={Number.isFinite(value) ? value : min}
            onValueChange={(nextValue) => updateCustomValue(String(nextValue))}
            className="pl-16"
            aria-label="مدت زمان دلخواه به دقیقه"
          />
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[11px] font-medium text-[var(--text-muted)]">
            دقیقه
          </span>
        </div>
      )}
    </div>
  );
}