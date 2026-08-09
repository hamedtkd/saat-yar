"use client";

import { Onboarding } from "@/components/layout/onboarding";
import { useSaatyarContext } from "@/components/saatyar-shell";

export default function OnboardingRoute() {
  const controller = useSaatyarContext();

  if (!controller.ready) return null;

  return (
    <Onboarding
      data={controller.data}
      setData={controller.setData}
      step={controller.onboardingStep}
      setStep={controller.setOnboardingStep}
    />
  );
}
