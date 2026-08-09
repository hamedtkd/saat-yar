import type { AppData, Settings } from "@/lib/types";
import type { OnboardingStep } from "@/lib/onboarding-session";

export type CommitImport = (
  next: AppData,
  message: string,
  options?: { safetyBackup?: boolean },
) => Promise<boolean>;

export type OnboardingProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  commitImport: CommitImport;
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

export type UpdateSettings = (updater: (settings: Settings) => Settings) => void;
