import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { faDigits } from "@/lib/format";
import { normalizeTime } from "./time-utils";
import type { TimeSuggestion } from "./types";

export function TimeSuggestions({ suggestions, draft, onSelect }: { suggestions: TimeSuggestion[]; draft: string; onSelect: (value: string) => void }) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      {suggestions.map((item) => {
        const normalizedValue = normalizeTime(item.value);
        const isSelected = normalizedValue === draft;

        return (
          <Button type="button" key={`${item.label}-${item.value}`} variant="outline" className="justify-between gap-2" onClick={() => onSelect(normalizedValue)}>
            <span>{item.label}</span>
            <b dir="ltr" className="tabular-nums">{faDigits(normalizedValue)}</b>
            {isSelected && <Check aria-hidden="true" className="size-4 text-[#079b60]" />}
          </Button>
        );
      })}
    </div>
  );
}
