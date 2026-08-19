"use client";

import { useId, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { ACTIVITY_TITLE_MAX_LENGTH } from "@/lib/activity-segments";

export function ActivityTitleField({
  value,
  suggestions,
  label,
  optionalLabel,
  placeholder,
  recentLabel,
  onChange,
}: {
  value: string;
  suggestions: string[];
  label: string;
  optionalLabel: string;
  placeholder: string;
  recentLabel: string;
  onChange: (value: string) => void;
}) {
  const inputId = useId();
  const listId = useId();
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const visibleSuggestions = useMemo(() => {
    const query = value.trim().toLocaleLowerCase();
    return suggestions
      .filter((item) => !query || item.toLocaleLowerCase().includes(query))
      .filter((item) => item !== value)
      .slice(0, 5);
  }, [suggestions, value]);
  const open = focused && !dismissed && visibleSuggestions.length > 0;

  function choose(index: number) {
    const next = visibleSuggestions[index];
    if (!next) return;
    onChange(next);
    setDismissed(true);
    setActiveIndex(-1);
  }

  return (
    <div className="relative grid min-w-0 content-start gap-1.5">
      <label htmlFor={inputId} className="flex min-h-5 items-center text-[11px] font-black text-[var(--text)]">
        <span className="inline-flex max-w-full items-center gap-1 whitespace-nowrap">
          <span>{label}</span>
          <small className="text-[9px] font-medium text-[var(--text-muted)]">({optionalLabel})</small>
        </span>
      </label>
      <Input
        id={inputId}
        data-activity-title
        value={value}
        maxLength={ACTIVITY_TITLE_MAX_LENGTH}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        onFocus={() => { setFocused(true); setDismissed(false); }}
        onBlur={() => { setFocused(false); setActiveIndex(-1); }}
        onChange={(event) => { setDismissed(false); setActiveIndex(-1); onChange(event.target.value); }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && visibleSuggestions.length) {
            event.preventDefault();
            setDismissed(false);
            setActiveIndex((index) => Math.min(visibleSuggestions.length - 1, index + 1));
          } else if (event.key === "ArrowUp" && open) {
            event.preventDefault();
            setActiveIndex((index) => Math.max(0, index - 1));
          } else if (event.key === "Enter" && open && activeIndex >= 0) {
            event.preventDefault();
            choose(activeIndex);
          } else if (event.key === "Escape" && open) {
            event.preventDefault();
            setDismissed(true);
            setActiveIndex(-1);
          }
        }}
      />
      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label={recentLabel}
          className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-1)] p-1 shadow-[var(--shadow-md)]"
        >
          <span className="block px-2 py-1 text-[9px] font-bold text-[var(--text-muted)]">{recentLabel}</span>
          {visibleSuggestions.map((item, index) => (
            <button
              key={item}
              id={`${listId}-${index}`}
              type="button"
              role="option"
              aria-selected={activeIndex === index}
              className={cn(
                "block w-full truncate rounded-lg px-2.5 py-2 text-start text-[11px] text-[var(--text)] hover:bg-[var(--accent-soft)]",
                activeIndex === index && "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
              )}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
