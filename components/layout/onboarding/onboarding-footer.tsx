import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function OnboardingFooter({ step, setStep, canContinue }: {
  step: number;
  setStep: (step: number) => void;
  canContinue: boolean;
}) {
  return (
    <footer className={cn("flex justify-between border-t border-[var(--border)] pt-[18px]")}>
      <Button type="button" variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>قبلی</Button>
      <Button type="submit" disabled={!canContinue}>
        {step < 4 ? "ادامه" : "شروع ساعت‌یار"}
        {step === 4 && <Check aria-hidden="true" />}
      </Button>
    </footer>
  );
}
