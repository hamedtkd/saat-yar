"use client";

import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppearanceSettings, Mode, ThemeMode } from "@/lib/types";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/cn";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { HeaderSaveStatus } from "./header-save-status";
import { headerControlShell, headerIconButton } from "./header-control-styles";
import { useLocale } from "@/components/i18n/locale-provider";

type Props = {
  mode: Mode;
  saveState: "idle" | "saving" | "saved" | "error";
  financialsHidden: boolean;
  onModeChange: (mode: Mode) => void;
  onToggleFinancials: () => void;
  appearance: AppearanceSettings;
  onThemeModeChange: (mode: ThemeMode) => void;
};

export function HeaderActions(props: Props) {
  const { t } = useLocale();
  const financialLabel = props.financialsHidden ? t("header.showFinancials") : t("header.hideFinancials");

  return (
    <div className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-2">
      <HeaderSaveStatus state={props.saveState} />
      <WorkspaceSwitcher mode={props.mode} onChange={props.onModeChange} />
      <div className={cn(headerControlShell, "flex items-center gap-0.5 p-1")}>
        <Button
          className={cn(headerIconButton, "max-[460px]:hidden")}
          variant="outline"
          size="icon"
          onClick={props.onToggleFinancials}
          aria-label={financialLabel}
          title={financialLabel}
        >
          {props.financialsHidden ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
        <ThemeToggle
          className={headerIconButton}
          mode={props.appearance.mode}
          onChange={props.onThemeModeChange}
        />
      </div>
    </div>
  );
}
