import type { AppData } from "@/lib/types";
import type { SetSetting } from "./types";

export function useOnboardingSettings(
  setData: React.Dispatch<React.SetStateAction<AppData>>,
): SetSetting {
  return <K extends keyof AppData["settings"]>(
    key: K,
    value: AppData["settings"][K],
  ) => {
    setData((previous) => ({
      ...previous,
      settings: { ...previous.settings, [key]: value },
    }));
  };
}
