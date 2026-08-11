import { Database, ShieldCheck } from "lucide-react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { cn } from "@/lib/cn";
import { StepShell } from "./step-shell";

export function PrivacyStep() {
  const { s } = useSystemUi();
  return <StepShell><span className={cn("mx-auto mb-5 mt-[70px] grid h-[82px] w-[82px] place-items-center rounded-3xl bg-[var(--accent-soft)] text-[var(--accent-strong)] [&_svg]:h-[46px] [&_svg]:w-[46px]")}><ShieldCheck /></span><h1>{s("Your data stays on your device")}</h1><p>{s("Saatyar works offline. Create a backup when moving to another device.")}</p><div className={cn("mx-auto my-[30px] flex max-w-[610px] items-center gap-[13px] rounded-xl border border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] bg-[var(--accent-soft)] p-[18px] text-start [&_svg]:h-7 [&_svg]:w-7 [&_svg]:text-[var(--accent-strong)] [&_div]:grid [&_span]:text-[11px] [&_span]:text-[var(--text-muted)]")}><Database /><div><strong>{s("Safe local storage")}</strong><span>{s("Core data is stored in your browser IndexedDB.")}</span></div></div></StepShell>;
}
