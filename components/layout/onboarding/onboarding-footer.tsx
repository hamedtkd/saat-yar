import { Check, Clock3 } from "lucide-react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const FINAL_STEP = 7;

export function OnboardingFooter({
  step,
  setStep,
  canContinue,
  reentry,
  onExit,
  onSkip,
}: {
  step: number;
  setStep: (step: number) => void;
  canContinue: boolean;
  reentry: boolean;
  onExit: () => void;
  onSkip: () => void;
}) {
  const { s } = useSystemUi();
  return (
    <footer className={cn("fixed inset-x-0 bottom-0 z-20 mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--page)_94%,transparent)] px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-[12px] shadow-[0_-10px_28px_rgba(0,0,0,.06)] backdrop-blur-md sm:static sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-[18px] sm:shadow-none sm:backdrop-blur-none")}>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>{s("Previous")}</Button>
        {reentry && <Button type="button" variant="ghost" onClick={onExit} data-onboarding-back-settings>{s("Back to Settings")}</Button>}
        {!reentry && step < FINAL_STEP && (
          <Button type="button" variant="ghost" onClick={onSkip} data-onboarding-skip>
            <Clock3 aria-hidden="true" /> {s("Skip for now")}
          </Button>
        )}
      </div>
      <Button type="submit" disabled={!canContinue}>{step < FINAL_STEP ? s("Continue") : reentry ? s("Save and return") : s("Start Saatyar")}{step === FINAL_STEP && <Check aria-hidden="true" />}</Button>
    </footer>
  );
}
