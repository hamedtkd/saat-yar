import type { AppData } from "@/lib/types";
import type { OnboardingStep } from "@/lib/onboarding-session";

export type OnboardingProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  step: OnboardingStep;
  setStep: (step: number) => void;
  reentry: boolean;
  onComplete: () => void;
  onExit: () => void;
};

export type SetSetting = <K extends keyof AppData["settings"]>(
  key: K,
  value: AppData["settings"][K],
) => void;
