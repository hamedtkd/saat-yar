"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import type { FormEvent, KeyboardEvent } from "react";

import { Brand } from "@/components/common/brand";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { cn } from "@/lib/cn";
import { markBrowserFirstRunGuidePending } from "@/lib/first-run-guide";
import { trackProductAnalytics, type OnboardingCompletionPath } from "@/lib/product-analytics";
import { AppearanceStep } from "./onboarding/appearance-step";
import { FreelancerClientStep } from "./onboarding/freelancer-client-step";
import { FreelancerProjectStep } from "./onboarding/freelancer-project-step";
import { HybridIncomeStep } from "./onboarding/hybrid-income-step";
import { ImportStep } from "./onboarding/import-step";
import { ModeStep } from "./onboarding/mode-step";
import { OnboardingFooter } from "./onboarding/onboarding-footer";
import { PayrollStep } from "./onboarding/payroll-step";
import { PrivacyStep } from "./onboarding/privacy-step";
import { ScheduleStep } from "./onboarding/schedule-step";
import { StepsProgress } from "./onboarding/steps-progress";
import type { OnboardingProps } from "./onboarding/types";
import { useOnboardingSettings } from "./onboarding/use-onboarding-settings";
import { WelcomeStep } from "./onboarding/welcome-step";

const FINAL_STEP = 7;

export function Onboarding({ data, setData, commitImport, step, setStep, reentry, onComplete, onExit }: OnboardingProps) {
  const { s } = useSystemUi();
  const { setSetting, updateSettings } = useOnboardingSettings(setData);
  const canContinue = step !== 1 || Boolean(data.settings.name.trim());
  const mode = data.settings.mode;

  useEffect(() => {
    trackProductAnalytics({ name: "onboarding_step_viewed", properties: { step, mode } });
  }, [step, mode]);

  const finishInitialSetup = (path: OnboardingCompletionPath = "advanced") => {
    setSetting("onboarded", true);
    if (!reentry) markBrowserFirstRunGuidePending();
    trackProductAnalytics({ name: "onboarding_completed", properties: { path, mode, timing: data.settings.workTimingMode } });
    onComplete();
  };

  const submitStep = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canContinue) return;
    if (step < FINAL_STEP) {
      setStep(step + 1);
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>("[data-onboarding-step] input, [data-onboarding-step] button")?.focus();
      });
      return;
    }
    finishInitialSetup();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    const target = event.target as HTMLElement;
    if (target.tagName === "TEXTAREA" || target.getAttribute("role") === "combobox") return;
    if (target.closest('[role="dialog"]')) return;
    if (target.closest("[data-onboarding-inline-form]")) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    event.currentTarget.requestSubmit();
  };

  return (
    <div className={cn("min-h-screen bg-[var(--page)] text-[var(--text)]")}>
      <header className={cn("flex min-h-[72px] items-center justify-between border-b border-[var(--border)] bg-[var(--surface-1)] px-5 py-3 sm:px-8")}>
        <Brand />
        <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-strong)] [&_svg]:h-[15px] [&_svg]:w-[15px] max-[620px]:hidden")}><CheckCircle2 /> {s("Autosave")}</span>
      </header>

      <form onSubmit={submitStep} onKeyDown={handleKeyDown} className={cn("mx-auto my-7 max-w-[1320px] px-5 pb-28 sm:pb-0 max-[620px]:mt-[16px] max-[620px]:px-[12px]")}>
        <StepsProgress step={step} mode={mode} />
        <div data-onboarding-step data-onboarding-step-index={step} data-onboarding-mode={mode}>
          {step === 1 && <WelcomeStep settings={data.settings} setSetting={setSetting} />}
          {step === 2 && <ModeStep settings={data.settings} setSetting={setSetting} onFastSetup={() => finishInitialSetup("fast-setup")} />}
          {step === 3 && (mode === "freelancer" ? <FreelancerClientStep data={data} setData={setData} /> : <ScheduleStep settings={data.settings} updateSettings={updateSettings} />)}
          {step === 4 && (mode === "employee"
            ? <PayrollStep settings={data.settings} updateSettings={updateSettings} />
            : mode === "freelancer"
              ? <FreelancerProjectStep data={data} setData={setData} />
              : <HybridIncomeStep data={data} setData={setData} updateSettings={updateSettings} />)}
          {step === 5 && <AppearanceStep settings={data.settings} updateSettings={updateSettings} />}
          {step === 6 && <PrivacyStep />}
          {step === 7 && <ImportStep data={data} commitImport={commitImport} />}
        </div>
        <OnboardingFooter step={step} setStep={setStep} canContinue={canContinue} reentry={reentry} onExit={onExit} onSkip={() => finishInitialSetup("skip")} />
      </form>
    </div>
  );
}
