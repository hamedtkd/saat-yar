"use client";

import type { ReactNode } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";

export type AppearanceSelectOption<T extends string> = {
  value: T;
  label: string;
  preview?: () => void;
  leading?: ReactNode;
  group?: string;
};

export function AppearanceSelectControl<T extends string>({
  label,
  value,
  options,
  onChange,
  onPreviewEnd,
}: {
  label: string;
  value: T;
  options: readonly AppearanceSelectOption<T>[];
  onChange: (value: T) => void;
  onPreviewEnd: () => void;
}) {
  const selected = options.find((option) => option.value === value);
  const groups = Array.from(new Set(options.map((option) => option.group ?? "")));
  return (
    <label className="grid gap-1.5">
      <span className="text-[10px] font-bold text-[var(--text-muted)]">{label}</span>
      <Select value={value} onValueChange={(next) => onChange(next as T)} onOpenChange={(open) => { if (!open) onPreviewEnd(); }}>
        <SelectTrigger className="min-h-10 bg-[var(--surface-1)] px-3 text-[11px]">
          <span className="flex min-w-0 items-center gap-2">
            {selected?.leading}
            <SelectValue />
          </span>
        </SelectTrigger>
        <SelectContent onPointerLeave={onPreviewEnd}>
          {groups.map((group, groupIndex) => {
            const groupOptions = options.filter((option) => (option.group ?? "") === group);
            return (
              <SelectGroup key={group || "default"}>
                {group ? <SelectLabel>{group}</SelectLabel> : null}
                {groupOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} onPointerEnter={option.preview} onFocus={option.preview}>
                    <span className="inline-flex items-center gap-2">
                      {option.leading}
                      <span>{option.label}</span>
                    </span>
                  </SelectItem>
                ))}
                {groupIndex < groups.length - 1 ? <SelectSeparator /> : null}
              </SelectGroup>
            );
          })}
        </SelectContent>
      </Select>
    </label>
  );
}
