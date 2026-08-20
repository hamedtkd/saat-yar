"use client";

import { useMemo, useState } from "react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { parseLocalizedNumber } from "@/lib/localized-number";
import { formatProjectRateAmount, hourlyRateToProjectUnit, projectRateToHourly, type ProjectRateUnit } from "@/lib/project-rate";

export function ProjectRateField({ hourlyRate, onHourlyRateChange }: { hourlyRate: number; onHourlyRateChange: (value: number) => void }) {
  const { locale, s } = useSystemUi();
  const [unit, setUnit] = useState<ProjectRateUnit>("hour");
  const displayAmount = hourlyRateToProjectUnit(hourlyRate, unit);
  const [draft, setDraft] = useState(() => formatProjectRateAmount(displayAmount, locale));
  const equivalent = useMemo(() => hourlyRateToProjectUnit(hourlyRate, unit === "hour" ? "day" : "hour"), [hourlyRate, unit]);

  const syncDraft = (nextUnit: ProjectRateUnit) => {
    setUnit(nextUnit);
    setDraft(formatProjectRateAmount(hourlyRateToProjectUnit(hourlyRate, nextUnit), locale));
  };

  const commit = (raw: string) => {
    const parsed = parseLocalizedNumber(raw);
    if (parsed == null) return;
    onHourlyRateChange(projectRateToHourly(parsed, unit));
  };

  return (
    <div className="grid gap-2">
      <div className="flex min-w-0 overflow-hidden rounded-[var(--control-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-2)] focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]">
        <Input
          data-onboarding-project-rate
          dir="ltr"
          inputMode="numeric"
          value={draft}
          onChange={(event) => { const parsed = parseLocalizedNumber(event.target.value); if (parsed == null) { setDraft(event.target.value); return; } setDraft(formatProjectRateAmount(parsed, locale)); commit(event.target.value); }}
          onFocus={() => setDraft(formatProjectRateAmount(displayAmount, locale))}
          onBlur={() => setDraft(formatProjectRateAmount(displayAmount, locale))}
          className="h-12 min-w-0 flex-1 rounded-none border-0 bg-transparent px-4 text-base font-black tabular-nums shadow-none focus-visible:ring-0"
          aria-label={s("Project rate")}
        />
        <Select value={unit} onValueChange={(value) => syncDraft(value as ProjectRateUnit)}>
          <SelectTrigger className="h-12 w-[118px] shrink-0 rounded-none border-y-0 border-e-0 border-s border-[var(--dashboard-border)] bg-[var(--surface-1)] px-3 shadow-none focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hour">{s("Per hour")}</SelectItem>
            <SelectItem value="day">{s("Per day")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <span className="text-[10px] leading-5 text-[var(--text-muted)]">
        {unit === "hour"
          ? s("Equivalent to {amount} Toman per 8-hour day", { amount: formatProjectRateAmount(equivalent, locale) })
          : s("Equivalent to {amount} Toman per hour", { amount: formatProjectRateAmount(equivalent, locale) })}
      </span>
    </div>
  );
}
