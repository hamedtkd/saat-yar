import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppearanceSettings, Mode, ThemeMode } from "@/lib/types";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { HeaderSaveStatus } from "./header-save-status";

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
  const financialLabel = props.financialsHidden ? "نمایش مبالغ مالی" : "مخفی کردن مبالغ مالی";

  return (
    <div className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-2">
      <HeaderSaveStatus state={props.saveState} />
      <WorkspaceSwitcher mode={props.mode} onChange={props.onModeChange} />
      <div className="flex items-center gap-1 rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-2)] p-1">
        <Button
          className="size-9 border-0 bg-transparent shadow-none max-[460px]:hidden"
          variant="outline"
          size="icon"
          onClick={props.onToggleFinancials}
          aria-label={financialLabel}
          title={financialLabel}
        >
          {props.financialsHidden ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
        <ThemeToggle mode={props.appearance.mode} onChange={props.onThemeModeChange} />
      </div>
    </div>
  );
}
