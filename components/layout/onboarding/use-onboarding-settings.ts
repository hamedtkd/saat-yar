import type { AppData } from "@/lib/types";
import type { SetSetting, UpdateSettings } from "./types";

export function useOnboardingSettings(
  setData: React.Dispatch<React.SetStateAction<AppData>>,
): { setSetting: SetSetting; updateSettings: UpdateSettings } {
  const setSetting: SetSetting = (key, value) => {
    setData((previous) => ({
      ...previous,
      settings: { ...previous.settings, [key]: value },
    }));
  };

  const updateSettings: UpdateSettings = (updater) => {
    setData((previous) => ({ ...previous, settings: updater(previous.settings) }));
  };

  return { setSetting, updateSettings };
}
