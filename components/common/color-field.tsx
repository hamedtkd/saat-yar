"use client";

import { Palette } from "lucide-react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { isHexColor } from "@/lib/theme";

type ColorFieldProps = {
  value: string;
  fallback: string;
  disabled?: boolean;
  invalid?: boolean;
  onChange: (value: string) => void;
};

export function ColorField({ value, fallback, disabled = false, invalid = false, onChange }: ColorFieldProps) {
  const { s } = useSystemUi();
  const safeColor = isHexColor(value) ? value : fallback;

  return (
    <div className="grid grid-cols-[112px_1fr] gap-2 max-[420px]:grid-cols-1">
      <label
        className={cn(
          "relative flex h-11 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs font-bold text-[var(--text)] transition-colors",
          "hover:border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent-soft)]",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <span className="size-5 rounded-full border border-[var(--border)] shadow-[inset_0_0_0_1px_rgb(255_255_255_/_12%)]" style={{ backgroundColor: safeColor }} />
        <Palette aria-hidden="true" className="size-4 text-[var(--text-muted)]" />
        <span>{s("Choose color")}</span>
        <input
          aria-label={s("Choose custom color")}
          type="color"
          disabled={disabled}
          value={safeColor}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
      </label>
      <Input
        dir="ltr"
        disabled={disabled}
        value={value}
        aria-label={s("Custom color code")}
        aria-invalid={invalid}
        spellCheck={false}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
