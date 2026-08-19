"use client";

import { BriefcaseBusiness } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import type { Mode } from "@/lib/types";
import { headerControlShell } from "./header-control-styles";
import { useLocale } from "@/components/i18n/locale-provider";

export function WorkspaceSwitcher({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) {
  const { t } = useLocale();
  return (
    <Select value={mode} onValueChange={(value) => onChange(value as Mode)}>
      <SelectTrigger
        aria-label={t("mode.switchLabel")}
        data-workspace-switch-trigger
        data-workspace-mode={mode}
        className={cn(
          headerControlShell,
          "w-auto min-w-[132px] justify-start gap-2 py-0 ps-2.5 pe-9 text-xs font-extrabold",
          "max-[520px]:min-w-0 max-[520px]:max-w-[132px] max-[520px]:flex-1 max-[520px]:ps-2 max-[520px]:text-[10px]",
          "max-[380px]:size-11 max-[380px]:min-w-11 max-[380px]:justify-center max-[380px]:px-0 max-[359px]:size-10 max-[359px]:min-w-10 max-[380px]:[&>svg]:hidden",
          "[&>svg]:end-2.5",
        )}
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-[9px] bg-[var(--accent-soft)] text-[var(--accent-strong)] max-[520px]:hidden max-[380px]:grid">
          <BriefcaseBusiness aria-hidden="true" className="size-4" />
        </span>
        <span className="min-w-0 max-[380px]:hidden"><SelectValue /></span>
      </SelectTrigger>
      <SelectContent className="min-w-[250px] max-[359px]:min-w-[calc(100vw-20px)]">
        <div className="mx-1 mb-1 grid gap-1 rounded-lg bg-[var(--surface-2)] px-2.5 py-2 text-[9px] leading-5 text-[var(--text-muted)]">
          <span><b className="text-[var(--text)]">{t("mode.employee")}:</b> {t("mode.employeeDescription")}</span>
          <span><b className="text-[var(--text)]">{t("mode.freelancer")}:</b> {t("mode.freelancerDescription")}</span>
          <span><b className="text-[var(--text)]">{t("mode.hybrid")}:</b> {t("mode.hybridDescription")}</span>
        </div>
        <SelectGroup>
          <SelectLabel>{t("mode.switchHint")}</SelectLabel>
          <SelectItem value="employee"><span data-workspace-mode-option="employee">{t("mode.employee")}</span></SelectItem>
          <SelectItem value="freelancer"><span data-workspace-mode-option="freelancer">{t("mode.freelancer")}</span></SelectItem>
          <SelectItem value="hybrid"><span data-workspace-mode-option="hybrid">{t("mode.hybrid")}</span></SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
