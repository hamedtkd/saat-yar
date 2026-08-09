import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const FINAL_STEP = 7;

export function OnboardingFooter({ step, setStep, canContinue, reentry, onExit }: {
  step: number;
  setStep: (step: number) => void;
  canContinue: boolean;
  reentry: boolean;
  onExit: () => void;
}) {
  return (
    <footer className={cn("flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-[18px]") }>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>قبلی</Button>
        {reentry && <Button type="button" variant="ghost" onClick={onExit}>بازگشت به تنظیمات</Button>}
      </div>
      <Button type="submit" disabled={!canContinue}>
        {step < FINAL_STEP ? "ادامه" : reentry ? "ذخیره و بازگشت" : "شروع ساعت‌یار"}
        {step === FINAL_STEP && <Check aria-hidden="true" />}
      </Button>
    </footer>
  );
}
