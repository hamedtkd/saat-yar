import type { AppData } from "@/lib/types";

export type OnboardingProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  step: number;
  setStep: (step: number) => void;
};

export type SetSetting = <K extends keyof AppData["settings"]>(
  key: K,
  value: AppData["settings"][K],
) => void;
