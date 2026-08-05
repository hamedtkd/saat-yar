import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { SetSetting } from "./types";

export function OnboardingFooter({ step, setStep, name, setSetting }: { step: number; setStep: (step: number) => void; name: string; setSetting: SetSetting }) {
  return (
    <footer className={cn("flex justify-between border-t border-[#dfe7e9] pt-[18px]")}>
      <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>قبلی</Button>
      {step < 4 ? (
        <Button onClick={() => setStep(step + 1)} disabled={step === 1 && !name.trim()}>ادامه</Button>
      ) : (
        <Button onClick={() => setSetting("onboarded", true)}>شروع ساعت‌یار<Check /></Button>
      )}
    </footer>
  );
}
