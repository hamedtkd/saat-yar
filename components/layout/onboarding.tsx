"use client";

import { CheckCircle2 } from "lucide-react";

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

  return (
    <div className={cn("fixed inset-0 z-[500] overflow-y-auto bg-[#fbfdfc]")}>
      <header className={cn("flex h-[88px] items-center justify-between border-b border-[#dfe7e9] px-[42px] max-[620px]:px-4")}>
        <Brand />
        <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold text-[#079b60] [&_svg]:h-[15px] [&_svg]:w-[15px] max-[620px]:hidden")}><CheckCircle2 /> ذخیره خودکار</span>
      </header>

      <section className={cn("mx-auto my-8 max-w-[1130px] px-6 max-[620px]:mt-[18px] max-[620px]:px-[14px]")}>
        <StepsProgress step={step} />
        {step === 1 && <WelcomeStep settings={data.settings} setSetting={setSetting} />}
        {step === 2 && <ModeStep settings={data.settings} setSetting={setSetting} />}
        {step === 3 && <ScheduleStep settings={data.settings} setSetting={setSetting} />}
        {step === 4 && <PrivacyStep />}
        <OnboardingFooter step={step} setStep={setStep} name={data.settings.name} setSetting={setSetting} />
      </section>
    </div>
  );
}
