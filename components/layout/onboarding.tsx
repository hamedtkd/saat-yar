"use client";

import { CheckCircle2 } from "lucide-react";
import type { FormEvent, KeyboardEvent } from "react";

import { Brand } from "@/components/common/brand";
import { cn } from "@/lib/cn";
import { ModeStep } from "./onboarding/mode-step";
import { OnboardingFooter } from "./onboarding/onboarding-footer";
import { PrivacyStep } from "./onboarding/privacy-step";
import { ScheduleStep } from "./onboarding/schedule-step";
import { StepsProgress } from "./onboarding/steps-progress";
import type { OnboardingProps } from "./onboarding/types";
import { useOnboardingSettings } from "./onboarding/use-onboarding-settings";
import { WelcomeStep } from "./onboarding/welcome-step";

export function Onboarding({ data, setData, step, setStep }: OnboardingProps) {
  const setSetting = useOnboardingSettings(setData);
  const canContinue = step !== 1 || Boolean(data.settings.name.trim());

  const submitStep = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canContinue) return;
    if (step < 4) {
      setStep(step + 1);
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>("[data-onboarding-step] input, [data-onboarding-step] button")?.focus();
      });
      return;
    }
    setSetting("onboarded", true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    const target = event.target as HTMLElement;
    if (target.tagName === "TEXTAREA" || target.getAttribute("role") === "combobox") return;
    if (target.closest('[role="dialog"]')) return;
    event.preventDefault();
    event.currentTarget.requestSubmit();
  };

  return (
    <div className={cn("fixed inset-0 z-[500] overflow-y-auto bg-[var(--page)] text-[var(--text)]")}>
      <header className={cn("flex min-h-[76px] items-center justify-between border-b border-[var(--border)] bg-[var(--surface-1)] px-5 py-3 sm:px-8")}>
        <Brand />
        <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-strong)] [&_svg]:h-[15px] [&_svg]:w-[15px] max-[620px]:hidden")}><CheckCircle2 /> ذخیره خودکار</span>
      </header>

      <form onSubmit={submitStep} onKeyDown={handleKeyDown} className={cn("mx-auto my-8 max-w-[1130px] px-6 max-[620px]:mt-[18px] max-[620px]:px-[14px]")}>
        <StepsProgress step={step} />
        <div data-onboarding-step>
          {step === 1 && <WelcomeStep settings={data.settings} setSetting={setSetting} />}
          {step === 2 && <ModeStep settings={data.settings} setSetting={setSetting} />}
          {step === 3 && <ScheduleStep settings={data.settings} setSetting={setSetting} />}
          {step === 4 && <PrivacyStep />}
        </div>
        <OnboardingFooter step={step} setStep={setStep} canContinue={canContinue} />
      </form>
    </div>
  );
}
