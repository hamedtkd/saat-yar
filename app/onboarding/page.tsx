"use client";

import { useRouter } from "next/navigation";
import { Onboarding } from "@/components/layout/onboarding";
import { useSaatyarContext } from "@/components/saatyar-shell";

const SETTINGS_ONBOARDING_PATH = "/settings#settings-onboarding";

export default function OnboardingRoute() {
  const router = useRouter();
  const controller = useSaatyarContext();

  if (!controller.ready || !controller.onboardingSessionReady) return null;

  const complete = () => {
    const reentry = controller.onboardingReentry;
    controller.finishOnboardingSession();
    if (reentry) router.replace(SETTINGS_ONBOARDING_PATH);
  };

  const exit = () => {
    controller.finishOnboardingSession();
    router.replace(SETTINGS_ONBOARDING_PATH);
  };

  return (
    <Onboarding
      data={controller.data}
      setData={controller.setData}
      commitImport={controller.commitImport}
      step={controller.onboardingStep}
      setStep={controller.setOnboardingStep}
      reentry={controller.onboardingReentry}
      onComplete={complete}
      onExit={exit}
    />
  );
}
