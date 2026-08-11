"use client";

import { useMemo, useState } from "react";
import { NumberField } from "@/components/common/number-field";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const { number, t } = useLocaleUi();
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
        <SelectTrigger aria-label={t("common.durationMinutesAria")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem value={String(option)} key={option}>
              {t("common.minutesCount", { count: number(option) })}
            </SelectItem>
          ))}
          <SelectItem value={CUSTOM_VALUE}>{t("common.customValue")}</SelectItem>
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
            className="ps-16"
            aria-label={t("common.customDurationMinutesAria")}
          />
          <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-[11px] font-medium text-[var(--text-muted)]">
            {t("common.minuteUnit")}
          </span>
        </div>
      )}
    </div>
  );
}