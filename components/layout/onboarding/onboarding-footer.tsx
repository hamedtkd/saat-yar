import { Check } from "lucide-react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
const FINAL_STEP = 7;
export function OnboardingFooter({ step, setStep, canContinue, reentry, onExit }: { step: number; setStep: (step: number) => void; canContinue: boolean; reentry: boolean; onExit: () => void }) {
  const { s } = useSystemUi();
  return <footer className={cn("flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-[18px]")}><div className="flex flex-wrap items-center gap-2"><Button type="button" variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>{s("Previous")}</Button>{reentry && <Button type="button" variant="ghost" onClick={onExit} data-onboarding-back-settings>{s("Back to Settings")}</Button>}</div><Button type="submit" disabled={!canContinue}>{step < FINAL_STEP ? s("Continue") : reentry ? s("Save and return") : s("Start Saatyar")}{step === FINAL_STEP && <Check aria-hidden="true" />}</Button></footer>;
}
